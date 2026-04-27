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
  el.classList.remove(...IONIC_HIDDEN_CLASSES);

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

/**
 * Parsea el resultado de un guard a formato normalizado.
 */
function _parseGuardResult(
  result: GuardResult,
): { allow: boolean; redirect?: string } {
  if (result === true) return { allow: true };
  if (result === false) return { allow: false };

  if (typeof result === "string") {
    return { allow: false, redirect: result };
  }

  if (typeof result === "object" && result && "redirect" in result) {
    return { allow: false, redirect: result.redirect };
  }

  return { allow: true };
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
    // Phantom oculto para no producir flash en redirects
    phantom.style.display = "none";
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

  /**
   * Ejecuta el guard preservando su naturaleza sync/async.
   *
   * Si el guard es sync (caso común — chequeo de un signal de auth),
   * retorna el resultado directamente SIN crear una Promise.
   * Esto es lo que permite que attachViewToDom sea sync y no haya
   * un microtask gap entre la creación del pageEl y el mount.
   */
  private _runGuard(
    routeDef: RouteDefinition,
    ctx: PageContext,
  ):
    | { allow: boolean; redirect?: string }
    | Promise<{ allow: boolean; redirect?: string }> {
    if (!routeDef.beforeEnter) return { allow: true };

    const result = routeDef.beforeEnter(ctx);

    if (result instanceof Promise) {
      return result.then(_parseGuardResult);
    }

    return _parseGuardResult(result);
  }

  private _createAndMount(
    pageEl: HTMLElement,
    routeDef: RouteDefinition,
    ctx: PageContext,
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

  /**
   * Crea el ion-page con su lifecycle y lo retorna SIN adjuntar al DOM.
   * El elemento se mantiene offscreen para que las animaciones de Ionic
   * no se ejecuten sobre un elemento vacío.
   */
  private _createPageEl(classes: string[]): {
    pageEl: HTMLElement;
    lc: PageLifecycle;
  } {
    const pageEl = document.createElement("ion-page");
    pageEl.classList.add("ion-page");
    if (classes?.length) pageEl.classList.add(...classes);

    const lc = createPageLifecycle();

    pageEl.addEventListener("ionViewWillEnter", () =>
      lc.willEnter.update((n) => n + 1),
    );
    pageEl.addEventListener("ionViewDidEnter", () =>
      lc.didEnter.update((n) => n + 1),
    );
    pageEl.addEventListener("ionViewWillLeave", () =>
      lc.willLeave.update((n) => n + 1),
    );
    pageEl.addEventListener("ionViewDidLeave", () =>
      lc.didLeave.update((n) => n + 1),
    );

    return { pageEl, lc };
  }

  /**
   * Monta la vista nueva: render del componente + commit al container.
   * Operación atómica — el browser nunca ve un ion-page sin contenido.
   */
  private _commitNewView(
    container: HTMLElement,
    routeDef: RouteDefinition,
    pageEl: HTMLElement,
    lc: PageLifecycle,
    params: Record<string, string>,
    cacheKey: string,
  ): HTMLElement {
    const ctx: PageContext = { lc, params };

    // 1. Mount del contenido en pageEl (offscreen — no toca el DOM visible)
    const cleanup = this._createAndMount(pageEl, routeDef, ctx);

    // 2. Cachear
    this._viewCache.set(cacheKey, { pageEl, lc, cleanup });

    // 3. Append al container — Ionic recibe el elemento YA con contenido,
    //    en el mismo tick. Sin gap, sin doble mount.
    container.appendChild(pageEl);
    _scheduleRouterSync();
    return pageEl;
  }

  /**
   * Re-adjunta una vista cacheada al container.
   * Operación atómica — reset de estado + append en el mismo tick.
   */
  private _commitCachedView(
    container: HTMLElement,
    cached: CachedView,
  ): HTMLElement {
    _resetIonicPageState(cached.pageEl);
    container.appendChild(cached.pageEl);
    _scheduleRouterSync();
    return cached.pageEl;
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

        // -------------------------------------------------------------------
        // attachViewToDom — flujo sync cuando es posible
        //
        // Antes (con doble mount visible):
        //   async attachViewToDom() {
        //     const pageEl = create();              // Ionic recibe Promise
        //     await guard();                        // microtask gap
        //     mount(pageEl);                        // contenido al fin
        //     append(pageEl);                       // append tarde
        //   }
        //   → Ionic ve un Promise pendiente, manipula el DOM esperando,
        //     cuando llega el elemento ya con contenido vuelve a montar.
        //
        // Ahora (sin doble mount):
        //   attachViewToDom() {                     // SYNC si guard es sync
        //     const pageEl = create();
        //     guard();                              // sync, sin microtask
        //     mount(pageEl);                        // contenido inmediato
        //     append(pageEl);                       // append en mismo tick
        //     return pageEl;                        // Ionic recibe HTMLElement
        //   }
        //   → Ionic recibe el elemento listo, una sola operación de mount.
        //
        // Si el guard es async (raro), se devuelve Promise igual que antes.
        // -------------------------------------------------------------------
        (outletEl as any).delegate = {

          attachViewToDom: (
            container: HTMLElement,
            componentTag: string,
            props: Record<string, string> | null,
            classes: string[],
          ): HTMLElement | Promise<HTMLElement> => {

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
              const guardResult = self._runGuard(routeDef, cachedCtx);

              // Guard async → fallback a Promise
              if (guardResult instanceof Promise) {
                return guardResult.then((result) => {
                  if (!result.allow) {
                    if (result.redirect) self._redirect(result.redirect);
                    return self._createPhantomView(container);
                  }
                  return self._commitCachedView(container, cached);
                });
              }

              // Guard sync → ejecución completa en un tick
              if (!guardResult.allow) {
                if (guardResult.redirect) self._redirect(guardResult.redirect);
                return self._createPhantomView(container);
              }

              return self._commitCachedView(container, cached);
            }

            // ── Primera visita ────────────────────────────────────────
            const { pageEl, lc } = self._createPageEl(classes);
            const ctx: PageContext = { lc, params };
            const guardResult = self._runGuard(routeDef, ctx);

            // Guard async → fallback a Promise
            if (guardResult instanceof Promise) {
              return guardResult.then((result) => {
                if (!result.allow) {
                  if (result.redirect) self._redirect(result.redirect);
                  return self._createPhantomView(container);
                }
                return self._commitNewView(
                  container, routeDef, pageEl, lc, params, cacheKey,
                );
              });
            }

            // Guard sync → mount + append en un tick, sin doble render
            if (!guardResult.allow) {
              if (guardResult.redirect) self._redirect(guardResult.redirect);
              return self._createPhantomView(container);
            }

            return self._commitNewView(
              container, routeDef, pageEl, lc, params, cacheKey,
            );
          },

          removeViewFromDom: async (
            _container: HTMLElement,
            component: HTMLElement,
          ): Promise<void> => {
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
