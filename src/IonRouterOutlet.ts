import { NixComponent, signal } from "@deijose/nix-js";
import type { NixTemplate, Signal } from "@deijose/nix-js";
import { createPageLifecycle, type PageLifecycle } from "./lifecycle";

// --------------------------------------------------------------------------
// Router store singleton
// --------------------------------------------------------------------------

export interface RouterInstance {
  navigate: (path: string, direction?: "forward" | "back" | "root") => void;
  replace: (path: string) => void;
  back: () => void;
  readonly path: Signal<string>;
  readonly params: Signal<Record<string, string>>;
  readonly canGoBack: Signal<boolean>;
}

export interface RouterState {
  readonly path: Signal<string>;
  readonly params: Signal<Record<string, string>>;
  readonly canGoBack: Signal<boolean>;
}

interface RoutePattern {
  regex: RegExp;
  keys: string[];
}

const _routerPath = signal<string>(_readPathFromLocation());
const _routerParams = signal<Record<string, string>>({});
const _routerCanGoBack = signal<boolean>(false);

let _eventsBound = false;
let _routePatterns: RoutePattern[] = [];

function _readPathFromLocation(): string {
  if (typeof window === "undefined") return "/";

  const hash = window.location.hash;
  if (hash.startsWith("#/")) {
    const hashPath = hash.slice(1).split("?")[0];
    return hashPath || "/";
  }

  return window.location.pathname || "/";
}

function _escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function _compileRoutePattern(path: string): RoutePattern {
  const keys: string[] = [];
  const segments = path.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { regex: /^\/$/, keys };
  }

  const body = segments
    .map((segment) => {
      if (segment.startsWith(":")) {
        keys.push(segment.slice(1));
        return "([^/]+)";
      }
      return _escapeRegExp(segment);
    })
    .join("/");

  return { regex: new RegExp(`^/${body}$`), keys };
}

function _setRoutePatterns(paths: string[]): void {
  _routePatterns = paths
    .filter((path) => path !== "*")
    .map(_compileRoutePattern);
}

function _extractParams(path: string): Record<string, string> {
  for (const pattern of _routePatterns) {
    const match = pattern.regex.exec(path);
    if (!match) continue;

    const params: Record<string, string> = {};
    for (let i = 0; i < pattern.keys.length; i++) {
      const key = pattern.keys[i];
      params[key] = decodeURIComponent(match[i + 1] ?? "");
    }
    return params;
  }

  return {};
}

async function _syncCanGoBackSignal(): Promise<void> {
  const router = document.querySelector("ion-router") as
    | { canGoBack?: () => boolean | Promise<boolean> }
    | null;

  if (router?.canGoBack) {
    const value = router.canGoBack();
    _routerCanGoBack.value = value instanceof Promise ? await value : Boolean(value);
    return;
  }

  _routerCanGoBack.value = window.history.length > 1;
}

async function _syncRouterSignals(): Promise<void> {
  const path = _readPathFromLocation();
  _routerPath.value = path;
  _routerParams.value = _extractParams(path);
  await _syncCanGoBackSignal();
}

function _ensureRouterEventsBound(): void {
  if (_eventsBound || typeof window === "undefined") return;

  const sync = () => {
    void _syncRouterSignals();
  };

  document.addEventListener("ionRouteWillChange", sync);
  document.addEventListener("ionRouteDidChange", sync);
  window.addEventListener("popstate", sync);
  window.addEventListener("hashchange", sync);

  _eventsBound = true;
}

function _scheduleRouterSync(): void {
  requestAnimationFrame(() => {
    void _syncRouterSignals();
  });
}

export function nixIonicRouter(): RouterInstance {
  _ensureRouterEventsBound();
  void _syncRouterSignals();

  return {
    navigate: (path, direction = "forward") => {
      const router = document.querySelector("ion-router");
      if (router && typeof (router as any).push === "function") {
        (router as any).push(path, direction);
        _scheduleRouterSync();
      }
    },
    replace: (path) => {
      const router = document.querySelector("ion-router");
      if (router && typeof (router as any).push === "function") {
        (router as any).push(path, "root");
        _scheduleRouterSync();
      }
    },
    back: () => {
      const router = document.querySelector("ion-router");
      if (router && typeof (router as any).back === "function") {
        (router as any).back();
        _scheduleRouterSync();
      }
    },
    path: _routerPath,
    params: _routerParams,
    canGoBack: _routerCanGoBack,
  };
}

export function nixIonicRouterState(): RouterState {
  _ensureRouterEventsBound();
  void _syncRouterSignals();

  return {
    path: _routerPath,
    params: _routerParams,
    canGoBack: _routerCanGoBack,
  };
}

// --------------------------------------------------------------------------
// IonBackButton
// --------------------------------------------------------------------------

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
      parent.insertBefore(btn, before);
      return () => btn.remove();
    },
  };
}

// --------------------------------------------------------------------------
// Tipos públicos
// --------------------------------------------------------------------------

export type GuardResult =
  | boolean
  | string
  | { redirect: string };

export type NavigationGuard = (ctx: PageContext) => GuardResult | Promise<GuardResult>;

export interface PageContext {
  lc: PageLifecycle;
  params: Record<string, string>;
}

export interface RouteDefinition {
  path: string;
  component: (ctx: PageContext) => NixComponent | NixTemplate;
  beforeEnter?: NavigationGuard;
}

// --------------------------------------------------------------------------
// Entrada de caché
// --------------------------------------------------------------------------

interface CachedView {
  pageEl: HTMLElement;
  lc: PageLifecycle;
  cleanup: () => void;
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/**
 * Clases CSS que Ionic aplica durante transiciones de salida.
 * Si la página sale animada, estas clases quedan en el elemento
 * y lo dejan invisible cuando se re-adjunta desde la caché.
 */
const IONIC_HIDDEN_CLASSES = [
  "ion-page-hidden",
  "ion-page-invisible",
  "can-go-back",
];

/**
 * Limpia el estado de animación/visibilidad que Ionic pudo haber aplicado
 * al elemento durante la transición de salida.
 * Se llama tanto al guardar en caché como al recuperar de caché.
 */
function _resetIonicPageState(el: HTMLElement): void {
  // Clases de visibilidad que Ionic gestiona
  el.classList.remove(...IONIC_HIDDEN_CLASSES);

  // Estilos inline que las animaciones de Ionic dejan (opacity, transform, etc.)
  // Solo limpiamos las propiedades que Ionic usa — no el style completo
  el.style.removeProperty("display");
  el.style.removeProperty("visibility");
  el.style.removeProperty("opacity");
  el.style.removeProperty("transform");
  el.style.removeProperty("animation");
  el.style.removeProperty("transition");
  el.style.removeProperty("pointer-events");
  el.style.removeProperty("z-index");
}

/**
 * Determina si una ruta tiene segmentos dinámicos (:param).
 */
function _hasDynamicSegments(path: string): boolean {
  return path.includes(":");
}

/**
 * Construye la cache key para una vista.
 *
 * Rutas estáticas (/home):         key = "/home"
 * Rutas dinámicas (/events/:id):   key = "/events/:id?id=abc"
 *   → una instancia POR combinación de params única
 */
function _buildCacheKey(routePath: string, params: Record<string, string>): string {
  if (!_hasDynamicSegments(routePath) || Object.keys(params).length === 0) {
    return routePath;
  }
  const sortedParams = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return `${routePath}?${sortedParams}`;
}

// --------------------------------------------------------------------------
// IonRouterOutlet
// --------------------------------------------------------------------------

export class IonRouterOutlet extends NixComponent {
  private routes: RouteDefinition[];
  private _viewCache = new Map<string, CachedView>();
  private _routeTagToDefinition = new Map<string, RouteDefinition>();

  constructor(routes: RouteDefinition[]) {
    super();
    this.routes = routes;

    let tagIndex = 0;
    const routablePaths: string[] = [];

    for (const route of this.routes) {
      if (route.path === "*") continue;
      this._routeTagToDefinition.set(`nix-route-${tagIndex++}`, route);
      routablePaths.push(route.path);
    }

    _setRoutePatterns(routablePaths);
    _ensureRouterEventsBound();
    void _syncRouterSignals();
  }

  private _createPhantomView(container: HTMLElement): HTMLElement {
    const phantom = document.createElement("ion-page");
    phantom.classList.add("ion-page");
    container.appendChild(phantom);
    return phantom;
  }

  private _redirect(path: string): void {
    requestAnimationFrame(() => {
      const router = document.querySelector("ion-router");
      if (router && typeof (router as any).push === "function") {
        (router as any).push(path, "root");
      }
      _scheduleRouterSync();
    });
  }

  private async _runGuard(
    routeDef: RouteDefinition,
    ctx: PageContext,
  ): Promise<{ allow: boolean; redirect?: string }> {
    if (!routeDef.beforeEnter) return { allow: true };

    const result = await routeDef.beforeEnter(ctx);

    if (result === false) return { allow: false };

    if (typeof result === "string") {
      return { allow: false, redirect: result };
    }

    if (typeof result === "object" && result && "redirect" in result) {
      return { allow: false, redirect: result.redirect };
    }

    return { allow: true };
  }

  private _createAndMount(
    pageEl: HTMLElement,
    routeDef: RouteDefinition,
    ctx: PageContext
  ): () => void {
    const pageNode = routeDef.component(ctx);

    if (
      "render" in pageNode &&
      typeof (pageNode as NixComponent).render === "function"
    ) {
      const comp = pageNode as NixComponent;
      comp.onInit?.();
      const renderCleanup = comp.render()._render(pageEl, null);
      const mountRet = comp.onMount?.();
      return () => {
        comp.onUnmount?.();
        if (typeof mountRet === "function") mountRet();
        renderCleanup();
      };
    } else {
      return (pageNode as NixTemplate)._render(pageEl, null);
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

        const routerEl = document.createElement("ion-router");
        routerEl.setAttribute("use-hash", "false");

        for (const [tag, routeDef] of self._routeTagToDefinition) {
          const routeEl = document.createElement("ion-route");
          routeEl.setAttribute("url", routeDef.path);
          routeEl.setAttribute("component", tag);
          routerEl.appendChild(routeEl);
        }

        const outletEl = document.createElement("ion-router-outlet");

        (outletEl as any).delegate = {

          attachViewToDom: async (
            container: HTMLElement,
            componentTag: string,
            props: Record<string, string> | null,
            classes: string[]
          ): Promise<HTMLElement> => {

            const routeDef = self._routeTagToDefinition.get(componentTag);

            if (!routeDef) {
              return self._createPhantomView(container);
            }

            const params = props ?? {};
            const cacheKey = _buildCacheKey(routeDef.path, params);

            // ── Vista cacheada ────────────────────────────────────────
            if (self._viewCache.has(cacheKey)) {
              const cached = self._viewCache.get(cacheKey)!;

              const cachedCtx: PageContext = { lc: cached.lc, params };
              const guardResult = await self._runGuard(routeDef, cachedCtx);

              if (!guardResult.allow) {
                if (guardResult.redirect) self._redirect(guardResult.redirect);
                return self._createPhantomView(container);
              }

              // Limpiar el estado CSS que Ionic dejó durante la salida.
              // Sin esto, ion-page-hidden (display:none !important) o
              // estilos de animación dejan la página invisible al re-adjuntarla.
              _resetIonicPageState(cached.pageEl);

              container.appendChild(cached.pageEl);
              _scheduleRouterSync();
              return cached.pageEl;
            }

            // ── Primera visita: crear instancia ───────────────────────
            const pageEl = document.createElement("ion-page");
            pageEl.classList.add("ion-page");
            if (classes?.length) pageEl.classList.add(...classes);

            const lc = createPageLifecycle();

            pageEl.addEventListener("ionViewWillEnter", () =>
              lc.willEnter.update((n) => n + 1)
            );
            pageEl.addEventListener("ionViewDidEnter", () =>
              lc.didEnter.update((n) => n + 1)
            );
            pageEl.addEventListener("ionViewWillLeave", () =>
              lc.willLeave.update((n) => n + 1)
            );
            pageEl.addEventListener("ionViewDidLeave", () =>
              lc.didLeave.update((n) => n + 1)
            );

            const ctx: PageContext = { lc, params };

            const guardResult = await self._runGuard(routeDef, ctx);
            if (!guardResult.allow) {
              if (guardResult.redirect) self._redirect(guardResult.redirect);
              return self._createPhantomView(container);
            }

            const cleanup = self._createAndMount(pageEl, routeDef, ctx);
            self._viewCache.set(cacheKey, { pageEl, lc, cleanup });
            container.appendChild(pageEl);
            _scheduleRouterSync();
            return pageEl;
          },

          removeViewFromDom: async (
            _container: HTMLElement,
            component: HTMLElement
          ): Promise<void> => {
            // Limpiar estado CSS de animación ANTES de cachear el elemento.
            // Ionic aplica clases como ion-page-hidden durante la transición
            // de salida. Si no se limpian aquí, la página queda invisible
            // cuando se recupera de caché en la siguiente visita.
            _resetIonicPageState(component);
            component.remove();
            _scheduleRouterSync();
          },
        };

        parent.insertBefore(routerEl, before);
        parent.insertBefore(outletEl, before);

        return () => {
          self._viewCache.forEach((cached) => {
            cached.cleanup();
            cached.pageEl.remove();
          });
          self._viewCache.clear();
          routerEl.remove();
          outletEl.remove();
        };
      },
    };
  }
}