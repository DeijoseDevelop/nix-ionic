import { NixComponent } from "@deijose/nix-js";
import type { NixTemplate } from "@deijose/nix-js";
import { createPageLifecycle, type PageLifecycle } from "./lifecycle";

// --------------------------------------------------------------------------
// Router store singleton
// --------------------------------------------------------------------------

export interface RouterInstance {
  navigate: (path: string, direction?: "forward" | "back" | "root") => void;
  replace:  (path: string) => void;
  back:     () => void;
  readonly path: string;
}

export function useRouter(): RouterInstance {
  return {
    navigate: (path, direction = "forward") => {
      const router = document.querySelector("ion-router");
      if (router && typeof (router as any).push === "function") {
        (router as any).push(path, direction);
      }
    },
    replace: (path) => {
      const router = document.querySelector("ion-router");
      if (router && typeof (router as any).push === "function") {
        (router as any).push(path, "root");
      }
    },
    back: () => {
      const router = document.querySelector("ion-router");
      if (router && typeof (router as any).back === "function") {
        (router as any).back();
      }
    },
    get path(): string {
      return window.location.pathname;
    },
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
  | { redirect: string };

export type NavigationGuard = (ctx: PageContext) => GuardResult | Promise<GuardResult>;

export interface PageContext {
  lc:     PageLifecycle;
  params: Record<string, string>;
}

export interface RouteDefinition {
  path:         string;
  component:    (ctx: PageContext) => NixComponent | NixTemplate;
  beforeEnter?: NavigationGuard;
}

// --------------------------------------------------------------------------
// Entrada de caché
// --------------------------------------------------------------------------

interface CachedView {
  pageEl:  HTMLElement;
  lc:      PageLifecycle;
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

  constructor(routes: RouteDefinition[]) {
    super();
    this.routes = routes;
  }

  private _pathToRouteId(path: string): string {
    if (!path || path === "/") return "nix-route-home";
    const clean = path
      .replace(/\/:?[^/]+/g, (m) =>
        "-" + m.replace(/\//g, "").replace(/:/g, "")
      )
      .replace(/^\//, "")
      .replace(/\//g, "-");
    return `nix-route-${clean}`;
  }

  private _createAndMount(
    pageEl:   HTMLElement,
    routeDef: RouteDefinition,
    ctx:      PageContext
  ): () => void {
    const pageNode = routeDef.component(ctx);

    if (
      "render" in pageNode &&
      typeof (pageNode as NixComponent).render === "function"
    ) {
      const comp = pageNode as NixComponent;
      comp.onInit?.();
      const renderCleanup = comp.render()._render(pageEl, null);
      const mountRet      = comp.onMount?.();
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

        self.routes
          .filter((r) => r.path !== "*")
          .forEach((r) => {
            const routeEl = document.createElement("ion-route");
            routeEl.setAttribute("url", r.path);
            routeEl.setAttribute("component", self._pathToRouteId(r.path));
            routerEl.appendChild(routeEl);
          });

        const outletEl = document.createElement("ion-router-outlet");

        (outletEl as any).delegate = {

          attachViewToDom: async (
            container:    HTMLElement,
            componentTag: string,
            props:        Record<string, string> | null,
            classes:      string[]
          ): Promise<HTMLElement> => {

            const routeDef = self.routes.find(
              (r) => self._pathToRouteId(r.path) === componentTag
            );

            if (!routeDef) {
              const phantom = document.createElement("ion-page");
              container.appendChild(phantom);
              return phantom;
            }

            const params   = props ?? {};
            const cacheKey = _buildCacheKey(routeDef.path, params);

            // ── Vista cacheada ────────────────────────────────────────
            if (self._viewCache.has(cacheKey)) {
              const cached = self._viewCache.get(cacheKey)!;

              // Limpiar el estado CSS que Ionic dejó durante la salida.
              // Sin esto, ion-page-hidden (display:none !important) o
              // estilos de animación dejan la página invisible al re-adjuntarla.
              _resetIonicPageState(cached.pageEl);

              container.appendChild(cached.pageEl);
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

            if (routeDef.beforeEnter) {
              const result = await routeDef.beforeEnter(ctx);

              if (result === false) {
                container.appendChild(pageEl);
                return pageEl;
              }

              if (typeof result === "object" && "redirect" in result) {
                container.appendChild(pageEl);
                requestAnimationFrame(() => {
                  const router = document.querySelector("ion-router");
                  if (router && typeof (router as any).push === "function") {
                    (router as any).push(result.redirect, "root");
                  }
                });
                return pageEl;
              }
            }

            const cleanup = self._createAndMount(pageEl, routeDef, ctx);
            self._viewCache.set(cacheKey, { pageEl, lc, cleanup });
            container.appendChild(pageEl);
            return pageEl;
          },

          removeViewFromDom: async (
            _container: HTMLElement,
            component:  HTMLElement
          ): Promise<void> => {
            // Limpiar estado CSS de animación ANTES de cachear el elemento.
            // Ionic aplica clases como ion-page-hidden durante la transición
            // de salida. Si no se limpian aquí, la página queda invisible
            // cuando se recupera de caché en la siguiente visita.
            _resetIonicPageState(component);
            component.remove();
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