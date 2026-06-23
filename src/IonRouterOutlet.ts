/**
 * @deijose/nix-ionic / IonRouterOutlet.ts  —  v2.5
 *
 *  Architecture: "core API + ion-router-outlet motor" (with auto-bootstrap)
 *
 *  Changes vs v2.4:
 *
 *  (E) Manual lifecycle dispatch on duration-0 transitions.
 *      EMPIRICAL FINDING: <ion-router-outlet>.commit() with `duration: 0`
 *      (used for direction: "none" and "root") does NOT fire the lifecycle
 *      events. We confirmed this with `replace("/login")` after a logout —
 *      the leaving page's `ionViewWillLeave` never ran.
 *
 *      The fix: when `direction` is "none" or "root", we synthesize the
 *      events ourselves around the commit() call, in the order Ionic
 *      documents:
 *        1. WillLeave on the leaving page  (BEFORE commit starts)
 *        2. WillEnter on the entering page (BEFORE commit starts)
 *        3. await commit()                  (instantaneous when duration=0)
 *        4. DidEnter on the entering page  (AFTER commit resolves)
 *        5. DidLeave on the leaving page   (AFTER DidEnter — Ionic docs)
 *
 *      For animated transitions ("forward"/"back") we still rely on Ionic
 *      to fire the events, since those go through the full animation path
 *      where the events ARE wired correctly.
 *
 *  Kept from earlier versions:
 *    (A) Anti-flash on first mount.
 *    (B) StackManager `back` recognition.
 *    (C) _hideInactivePages defensive sweep after every transition.
 *    (D) Manual lifecycle dispatch on first mount (no leaving page).
 *
 *  Subclass note for IonPage users: if you override `onInit()` in a
 *  subclass, you MUST call `super.onInit()` first. The base IonPage uses
 *  onInit to wire `watch()` calls onto the lifecycle signals — without the
 *  super call, your `ionViewWillEnter`/etc. methods never fire.
 */

import { NixComponent, effect } from "@deijose/nix-js";
import type { NixTemplate } from "@deijose/nix-js";
import {
    nixRouter,
    createRouter,
    _hasActiveRouter,
    type Router,
    type RouteRecord,
    type NavigationGuard,
    type NavigationIntent,
    type NavigationDirection,
} from "@deijose/nix-js";
import { createPageLifecycle, type PageLifecycle } from "./lifecycle";

// =============================================================================
//  Public types
// =============================================================================

export type GuardResult =
    | boolean
    | string
    | { redirect: string }
    | void
    | undefined;

export interface PageContext {
    lc: PageLifecycle;
    params: Record<string, string>;
}

export interface RouteDefinition {
    path: string;
    component: (ctx: PageContext) => NixComponent | NixTemplate;
    beforeEnter?: (ctx: PageContext) => GuardResult | Promise<GuardResult>;
}

export interface IonRouterOutletOptions {
    cache?: boolean;
    defaultAnimation?: unknown;
    tabs?: string[];
    skipAutoBootstrap?: boolean;
}

// =============================================================================
//  Helpers
// =============================================================================

function adaptGuardForCore(
    routePath: string,
    pageGuard: (ctx: PageContext) => GuardResult | Promise<GuardResult>,
): NavigationGuard {
    return (to: string, _from: string) => {
        const params = extractParamsFromPath(routePath, to);
        const lc = createPageLifecycle();
        return pageGuard({ lc, params }) as any;
    };
}

function extractParamsFromPath(pattern: string, actual: string): Record<string, string> {
    const patternParts = pattern.split("/").filter(Boolean);
    const actualParts = actual.split("/").filter(Boolean);
    const params: Record<string, string> = {};
    for (let i = 0; i < patternParts.length && i < actualParts.length; i++) {
        const p = patternParts[i];
        if (p.startsWith(":")) {
            try {
                params[p.slice(1)] = decodeURIComponent(actualParts[i] ?? "");
            } catch {
                params[p.slice(1)] = actualParts[i] ?? "";
            }
        }
    }
    return params;
}

function _parseGuardResult(r: GuardResult): { allow: boolean; redirect?: string } {
    if (r === false) return { allow: false };
    if (r === true || r === undefined || r === null) return { allow: true };
    if (typeof r === "string") return { allow: false, redirect: r };
    if (typeof r === "object" && "redirect" in r && typeof r.redirect === "string") {
        return { allow: false, redirect: r.redirect };
    }
    return { allow: true };
}

function buildCoreRouteRecords(routes: RouteDefinition[]): RouteRecord[] {
    return routes.map((r): RouteRecord => ({
        path: r.path,
        component: undefined,
        beforeEnter: r.beforeEnter
            ? adaptGuardForCore(r.path, r.beforeEnter)
            : undefined,
    }));
}

interface CachedView {
    pageEl: HTMLElement;
    lc: PageLifecycle;
    cleanup: () => void;
    cacheKey: string;
}

const IONIC_STATE_CLASSES_TO_RESET = ["ion-page-hidden", "can-go-back"];

function _resetCachedPageState(el: HTMLElement): void {
    el.classList.remove(...IONIC_STATE_CLASSES_TO_RESET);
    el.style.removeProperty("display");
    el.style.removeProperty("visibility");
    el.style.removeProperty("opacity");
    el.style.removeProperty("transform");
    el.style.removeProperty("animation");
    el.style.removeProperty("transition");
    el.style.removeProperty("pointer-events");
    el.style.removeProperty("z-index");
}

function _hasDynamicSegments(path: string): boolean {
    return path.includes(":");
}

function _buildCacheKey(routePath: string, params: Record<string, string>): string {
    if (!_hasDynamicSegments(routePath) || Object.keys(params).length === 0) {
        return routePath;
    }
    const sorted = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");
    return `${routePath}?${sorted}`;
}

/**
 * Synthesize an Ionic page-lifecycle event on a pageEl. Used when commit()
 * either won't run at all (first mount) or runs with duration:0 (which
 * empirically does not fire lifecycle events in Ionic).
 */
function _dispatchIonicLifecycle(
    pageEl: HTMLElement,
    name: "ionViewWillEnter" | "ionViewDidEnter" | "ionViewWillLeave" | "ionViewDidLeave",
): void {
    pageEl.dispatchEvent(new CustomEvent(name, {
        bubbles: true,
        cancelable: false,
        composed: true,
    }));
}

// =============================================================================
//  Stack manager
// =============================================================================

interface TabStack {
    prefix: string;
    entries: string[];
}

class StackManager {
    private _stacks = new Map<string, TabStack>();
    private _activeTabKey: string;
    private _tabPrefixes: string[];

    constructor(tabs: string[] | undefined) {
        this._stacks.set("", { prefix: "", entries: [] });
        if (tabs?.length) {
            for (const prefix of tabs) {
                const norm = this._normalize(prefix);
                this._stacks.set(norm, { prefix: norm, entries: [] });
            }
            this._tabPrefixes = tabs.map((t) => this._normalize(t))
                .sort((a, b) => b.length - a.length);
        } else {
            this._tabPrefixes = [];
        }
        this._activeTabKey = "";
    }

    keyForPath(path: string): string {
        for (const prefix of this._tabPrefixes) {
            if (path === prefix || path.startsWith(prefix + "/")) {
                return prefix;
            }
        }
        return "";
    }

    apply(path: string, intent: NavigationIntent): NavigationDirection {
        const targetKey = this.keyForPath(path);
        const stack = this._stacks.get(targetKey)!;

        if (targetKey !== this._activeTabKey) {
            this._activeTabKey = targetKey;
            const top = stack.entries[stack.entries.length - 1];
            if (top !== path) stack.entries.push(path);
            return "none";
        }

        if (intent.direction === "back") {
            while (stack.entries.length > 0
                && stack.entries[stack.entries.length - 1] !== path) {
                stack.entries.pop();
            }
            if (stack.entries.length === 0) stack.entries.push(path);
            return "back";
        }

        if (intent.action === "replace" || intent.direction === "root") {
            if (stack.entries.length === 0) stack.entries.push(path);
            else stack.entries[stack.entries.length - 1] = path;
            return intent.direction === "forward" ? "forward" : "root";
        }

        if (intent.action === "initial") {
            if (stack.entries.length === 0) stack.entries.push(path);
            return "none";
        }

        const top = stack.entries[stack.entries.length - 1];
        if (top !== path) stack.entries.push(path);
        return intent.direction;
    }

    private _normalize(p: string): string {
        if (!p || p === "/") return "/";
        return p.endsWith("/") ? p.slice(0, -1) : p;
    }
}

// =============================================================================
//  Cache registry
// =============================================================================

class CacheRegistry {
    private _byTab = new Map<string, Map<string, CachedView>>();

    get(tabKey: string, cacheKey: string): CachedView | undefined {
        return this._byTab.get(tabKey)?.get(cacheKey);
    }

    set(tabKey: string, cacheKey: string, view: CachedView): void {
        let map = this._byTab.get(tabKey);
        if (!map) { map = new Map(); this._byTab.set(tabKey, map); }
        map.set(cacheKey, view);
    }

    delete(tabKey: string, cacheKey: string): void {
        this._byTab.get(tabKey)?.delete(cacheKey);
    }

    *all(): Generator<{ tabKey: string; cacheKey: string; view: CachedView }> {
        for (const [tabKey, map] of this._byTab.entries()) {
            for (const [cacheKey, view] of map.entries()) {
                yield { tabKey, cacheKey, view };
            }
        }
    }

    clear(): void {
        this._byTab.clear();
    }
}

// =============================================================================
//  IonBackButton
// =============================================================================

export function IonBackButton(defaultHref: string = "/"): NixTemplate {
    return {
        __isNixTemplate: true as const,
        mount(container: Element | string) {
            const el = typeof container === "string"
                ? document.querySelector(container)!
                : container;
            const cleanup = this._render(el, null);
            return { unmount: cleanup };
        },
        _render(parent: Node, before: Node | null): () => void {
            const btn = document.createElement("ion-back-button");
            btn.setAttribute("default-href", defaultHref);
            const onClick = (ev: Event) => {
                ev.preventDefault();
                ev.stopPropagation();
                const router = nixRouter();
                if (router.canGoBack.value) {
                    router.back();
                } else {
                    router.replace(defaultHref);
                }
            };
            btn.addEventListener("click", onClick);
            parent.insertBefore(btn, before);
            return () => {
                btn.removeEventListener("click", onClick);
                btn.remove();
            };
        },
    };
}

// =============================================================================
//  IonRouterOutlet
// =============================================================================

export class IonRouterOutlet extends NixComponent {
    private _routesByPath = new Map<string, RouteDefinition>();
    private _enableCache: boolean;
    private _defaultAnimation: unknown;

    private _stacks: StackManager;
    private _cache = new CacheRegistry();

    private _activePageEl: HTMLElement | null = null;
    private _activeCacheKey: string | null = null;
    private _activeTabKey: string | null = null;

    private _outletEl: HTMLElement | null = null;
    private _routeEffectDisposer: (() => void) | null = null;

    private _isTransitioning = false;
    private _pendingNav: { path: string } | null = null;

    constructor(routes: RouteDefinition[], opts: IonRouterOutletOptions = {}) {
        super();
        this._enableCache = opts.cache ?? true;
        this._defaultAnimation = opts.defaultAnimation;
        this._stacks = new StackManager(opts.tabs);

        for (const r of routes) {
            if (r.path === "*") continue;
            this._routesByPath.set(r.path, r);
        }

        if (!opts.skipAutoBootstrap && !_hasActiveRouter()) {
            createRouter(buildCoreRouteRecords(routes));
        }
    }

    private _resolveRouteDefinition(currentPath: string): {
        def: RouteDefinition;
        params: Record<string, string>;
    } | null {
        const router = nixRouter();
        const resolved = router.resolve(currentPath);
        if (!resolved.matched || !resolved.route) return null;
        const def = this._routesByPath.get(resolved.route.path);
        if (!def) return null;
        return { def, params: resolved.params };
    }

    private _createPageEl(): { pageEl: HTMLElement; lc: PageLifecycle } {
        const pageEl = document.createElement("ion-page");
        pageEl.classList.add("ion-page");
        pageEl.classList.add("ion-page-invisible");
        const lc = createPageLifecycle();
        pageEl.addEventListener("ionViewWillEnter", () =>
            lc.willEnter.update((n) => n + 1));
        pageEl.addEventListener("ionViewDidEnter", () =>
            lc.didEnter.update((n) => n + 1));
        pageEl.addEventListener("ionViewWillLeave", () =>
            lc.willLeave.update((n) => n + 1));
        pageEl.addEventListener("ionViewDidLeave", () =>
            lc.didLeave.update((n) => n + 1));
        return { pageEl, lc };
    }

    private _mountComponent(
        pageEl: HTMLElement,
        def: RouteDefinition,
        ctx: PageContext,
    ): () => void {
        const node = def.component(ctx);
        if ("render" in node && typeof (node as NixComponent).render === "function") {
            const comp = node as NixComponent;
            comp.onInit?.();
            const renderCleanup = comp.render()._render(pageEl, null);
            const mountRet = comp.onMount?.();
            return () => {
                comp.onUnmount?.();
                if (typeof mountRet === "function") mountRet();
                renderCleanup();
            };
        } else {
            return (node as NixTemplate)._render(pageEl, null);
        }
    }

    private _hideInactivePages(activeEl: HTMLElement | null): void {
        const outletEl = this._outletEl;
        if (!outletEl) return;
        const children = Array.from(outletEl.children);
        for (const child of children) {
            if (!(child instanceof HTMLElement)) continue;
            if (child.tagName !== "ION-PAGE" && !child.classList.contains("ion-page")) continue;
            if (child === activeEl) {
                child.classList.remove("ion-page-hidden");
            } else {
                child.classList.add("ion-page-hidden");
            }
        }
    }

    private async _transitionTo(
        targetPath: string,
        intent: NavigationIntent,
    ): Promise<void> {
        const outletEl = this._outletEl;
        if (!outletEl) return;

        const resolved = this._resolveRouteDefinition(targetPath);
        if (!resolved) return;

        const { def, params } = resolved;
        const cacheKey = _buildCacheKey(def.path, params);
        const targetTabKey = this._stacks.keyForPath(targetPath);

        if (cacheKey === this._activeCacheKey && targetTabKey === this._activeTabKey) return;

        if (this._isTransitioning) {
            this._pendingNav = { path: targetPath };
            return;
        }
        this._isTransitioning = true;

        try {
            // Page-level guard
            if (def.beforeEnter) {
                const cached = this._cache.get(targetTabKey, cacheKey);
                const lcForGuard = cached?.lc ?? createPageLifecycle();
                const guardResult = await Promise.resolve(
                    def.beforeEnter({ lc: lcForGuard, params }),
                );
                const parsed = _parseGuardResult(guardResult);
                if (!parsed.allow) {
                    if (parsed.redirect) nixRouter().replace(parsed.redirect);
                    return;
                }
            }

            // Resolve entering page
            let enteringEl: HTMLElement;
            let isNewlyMounted = false;
            const cached = this._enableCache
                ? this._cache.get(targetTabKey, cacheKey)
                : undefined;

            if (cached) {
                _resetCachedPageState(cached.pageEl);
                cached.pageEl.classList.add("ion-page-invisible");
                enteringEl = cached.pageEl;
            } else {
                const { pageEl, lc } = this._createPageEl();
                const cleanup = this._mountComponent(pageEl, def, { lc, params });
                if (this._enableCache) {
                    this._cache.set(targetTabKey, cacheKey, { pageEl, lc, cleanup, cacheKey });
                }
                enteringEl = pageEl;
                isNewlyMounted = true;
            }

            if (!outletEl.contains(enteringEl)) {
                outletEl.appendChild(enteringEl);
            }

            const direction = this._stacks.apply(targetPath, intent);
            const leavingEl = this._activePageEl;

            // ── First mount (no leaving page) ─────────────────────────
            if (!leavingEl || leavingEl === enteringEl) {
                this._activePageEl = enteringEl;
                this._activeCacheKey = cacheKey;
                this._activeTabKey = targetTabKey;

                const finalEl = enteringEl;
                _dispatchIonicLifecycle(finalEl, "ionViewWillEnter");

                if (isNewlyMounted) {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            finalEl.classList.remove("ion-page-invisible");
                            this._hideInactivePages(finalEl);
                            _dispatchIonicLifecycle(finalEl, "ionViewDidEnter");
                        });
                    });
                } else {
                    finalEl.classList.remove("ion-page-invisible");
                    this._hideInactivePages(finalEl);
                    _dispatchIonicLifecycle(finalEl, "ionViewDidEnter");
                }
                return;
            }

            // ── Build commit options ──────────────────────────────────
            const animationBuilder = (intent.animation ?? this._defaultAnimation) as
                | undefined | unknown;

            // duration:0 is what Ionic uses for "no animation" navigations.
            // Empirically, this path skips lifecycle event dispatch — so we
            // synthesize them manually around the commit() call.
            const isDuration0 = direction === "root" || direction === "none";

            const commitOpts: any = {
                duration: isDuration0 ? 0 : undefined,
                direction:
                    direction === "back" ? "back"
                        : direction === "forward" ? "forward"
                            : undefined,
                showGoBack: direction === "forward",
            };
            if (animationBuilder) commitOpts.animationBuilder = animationBuilder;

            // ── Pre-commit lifecycle (only on duration-0 paths) ───────
            // Ionic docs: WillLeave fires BEFORE WillEnter.
            // Animated paths (duration > 0): commit() handles dispatch.
            if (isDuration0) {
                _dispatchIonicLifecycle(leavingEl, "ionViewWillLeave");
                _dispatchIonicLifecycle(enteringEl, "ionViewWillEnter");
            }

            await (outletEl as any).commit(enteringEl, leavingEl, commitOpts);

            this._activePageEl = enteringEl;
            this._activeCacheKey = cacheKey;
            this._activeTabKey = targetTabKey;

            this._hideInactivePages(enteringEl);

            // ── Post-commit lifecycle (only on duration-0 paths) ──────
            // Ionic docs: DidLeave fires AFTER DidEnter (after the new
            // page has fully transitioned in).
            if (isDuration0) {
                _dispatchIonicLifecycle(enteringEl, "ionViewDidEnter");
                _dispatchIonicLifecycle(leavingEl, "ionViewDidLeave");
            }

            if (!this._enableCache && leavingEl.parentElement === outletEl) {
                leavingEl.remove();
            }
        } finally {
            this._isTransitioning = false;

            if (this._pendingNav) {
                const next = this._pendingNav;
                this._pendingNav = null;
                const router = nixRouter();
                void this._transitionTo(next.path, router.intent.value);
            }
        }
    }

    override render(): NixTemplate {
        const self = this;
        return {
            __isNixTemplate: true as const,

            mount(container: Element | string) {
                const el = typeof container === "string"
                    ? document.querySelector(container)!
                    : container;
                const cleanup = this._render(el, null);
                return { unmount: cleanup };
            },

            _render(parent: Node, before: Node | null): () => void {
                const outletEl = document.createElement("ion-router-outlet");
                self._outletEl = outletEl;

                (outletEl as any).delegate = {
                    attachViewToDom: (
                        container: HTMLElement,
                        component: HTMLElement,
                    ): HTMLElement => {
                        if (component && !container.contains(component)) {
                            container.appendChild(component);
                        }
                        return component;
                    },
                    removeViewFromDom: async (): Promise<void> => { /* no-op */ },
                };

                parent.insertBefore(outletEl, before);

                const router: Router = nixRouter();
                let lastSeenPath: string | null = null;
                let initialDeferred = false;

                self._routeEffectDisposer = effect(() => {
                    const path = router.current.value;
                    const intent = router.intent.value;

                    if (!initialDeferred) {
                        initialDeferred = true;
                        queueMicrotask(() => {
                            const settledPath = router.current.value;
                            const settledIntent = router.intent.value;
                            lastSeenPath = settledPath;
                            void self._transitionTo(settledPath, settledIntent);
                        });
                        return;
                    }

                    if (path === lastSeenPath) return;
                    lastSeenPath = path;
                    void self._transitionTo(path, intent);
                });

                return () => {
                    self._routeEffectDisposer?.();
                    self._routeEffectDisposer = null;
                    for (const { view } of self._cache.all()) {
                        view.cleanup();
                        if (view.pageEl.parentElement) view.pageEl.remove();
                    }
                    self._cache.clear();
                    self._activePageEl = null;
                    self._activeCacheKey = null;
                    self._activeTabKey = null;
                    self._outletEl = null;
                    outletEl.remove();
                };
            },
        };
    }

    invalidateCache(
        routePath: string,
        params?: Record<string, string>,
        tabKey?: string,
    ): void {
        const key = params ? _buildCacheKey(routePath, params) : routePath;
        const targetTabKey = tabKey ?? this._stacks.keyForPath(routePath);
        const cached = this._cache.get(targetTabKey, key);
        if (!cached) return;
        cached.cleanup();
        if (cached.pageEl !== this._activePageEl && cached.pageEl.parentElement) {
            cached.pageEl.remove();
        }
        this._cache.delete(targetTabKey, key);
        if (key === this._activeCacheKey && targetTabKey === this._activeTabKey) {
            this._activeCacheKey = null;
        }
    }

    clearCache(): void {
        const entries: Array<{ tabKey: string; cacheKey: string; view: CachedView }> = [];
        for (const e of this._cache.all()) entries.push(e);
        for (const { tabKey, cacheKey, view } of entries) {
            if (view.pageEl === this._activePageEl) continue;
            view.cleanup();
            if (view.pageEl.parentElement) view.pageEl.remove();
            this._cache.delete(tabKey, cacheKey);
        }
    }
}