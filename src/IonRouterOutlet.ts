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
// Entrada de caché — modelo Angular
// --------------------------------------------------------------------------

interface CachedView {
  pageEl:   HTMLElement;       // El ion-page real, persiste en memoria
  lc:       PageLifecycle;     // Signals de lifecycle, misma instancia siempre
  cleanup:  () => void;        // Destrucción real: signals + render + onUnmount
}

// --------------------------------------------------------------------------
// IonRouterOutlet
// --------------------------------------------------------------------------

export class IonRouterOutlet extends NixComponent {
  private routes: RouteDefinition[];

  /**
   * Caché de vistas — igual que Angular mantiene instancias vivas.
   * Clave: path de la ruta (e.g. "/home", "/profile/:id")
   */
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

  /**
   * Crea la instancia del componente y la monta en pageEl.
   * Solo se llama UNA vez por ruta — igual que Angular crea
   * el componente una sola vez.
   */
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

      // onInit: una sola vez, igual que ngOnInit en Angular
      comp.onInit?.();

      const renderCleanup = comp.render()._render(pageEl, null);
      const mountRet      = comp.onMount?.();

      // Retorna el destructor real
      return () => {
        comp.onUnmount?.();
        if (typeof mountRet === "function") mountRet();
        renderCleanup();
      };
    } else {
      const renderCleanup = (pageNode as NixTemplate)._render(pageEl, null);
      return renderCleanup;
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

        // ── ion-router ────────────────────────────────────────────────
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

        // ── ion-router-outlet ─────────────────────────────────────────
        const outletEl = document.createElement("ion-router-outlet");

        (outletEl as any).delegate = {

          /**
           * Ionic llama esto al navegar a una ruta.
           *
           * Modelo Angular:
           *   - Primera vez  → crear instancia, onInit, montar, cachear
           *   - Siguientes   → recuperar pageEl cacheado, solo re-adjuntar
           */
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
              // Ruta desconocida — Ionic igual necesita un ion-page
              const phantom = document.createElement("ion-page");
              container.appendChild(phantom);
              return phantom;
            }

            const cacheKey = routeDef.path;

            // ── Vista ya existe en caché (modelo Angular) ─────────────
            if (self._viewCache.has(cacheKey)) {
              const cached = self._viewCache.get(cacheKey)!;

              // Solo re-adjuntar al container — sin recrear nada
              container.appendChild(cached.pageEl);
              return cached.pageEl;
            }

            // ── Primera visita: crear instancia ───────────────────────
            const pageEl = document.createElement("ion-page");
            pageEl.classList.add("ion-page");
            if (classes?.length) pageEl.classList.add(...classes);

            const lc = createPageLifecycle();

            // Conectar eventos de Ionic a las signals del lifecycle
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

            // Evaluar guard
            const params: Record<string, string> = props ?? {};
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

            // Montar componente — onInit ocurre aquí, solo esta vez
            const cleanup = self._createAndMount(pageEl, routeDef, ctx);

            // Guardar en caché
            self._viewCache.set(cacheKey, { pageEl, lc, cleanup });

            container.appendChild(pageEl);
            return pageEl;
          },

          /**
           * Ionic llama esto al salir de una ruta.
           *
           * Modelo Angular:
           *   - Solo detach del DOM — NO destruir la instancia
           *   - La instancia permanece en _viewCache
           *
           * La destrucción real ocurre solo si el router
           * elimina la ruta del stack definitivamente (ver cleanup global).
           */
          removeViewFromDom: async (
            _container: HTMLElement,
            component:  HTMLElement
          ): Promise<void> => {
            // Solo desconectar del DOM — la instancia sigue viva
            component.remove();

            // No tocar _viewCache aquí.
            // La instancia permanece lista para la próxima visita.
          },
        };

        parent.insertBefore(routerEl, before);
        parent.insertBefore(outletEl, before);

        // Cleanup global: cuando el outlet entero se desmonta
        // destruir todas las instancias cacheadas
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