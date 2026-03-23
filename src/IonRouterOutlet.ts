import { NixComponent } from "@deijose/nix-js";
import type { NixTemplate } from "@deijose/nix-js";
import { createPageLifecycle, type PageLifecycle } from "./lifecycle";

// --------------------------------------------------------------------------
// Router store singleton
// --------------------------------------------------------------------------

export function useRouter() {
  return {
    navigate: (path: string, direction: "forward" | "back" | "root" = "forward") => {
      const router = document.querySelector("ion-router");
      if (router && typeof (router as any).push === "function") {
        (router as any).push(path, direction);
      }
    },
    replace: (path: string) => {
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
    }
  };
}

// --------------------------------------------------------------------------
// IonBackButton (Sin listeners, 100% nativo)
// --------------------------------------------------------------------------

export function IonBackButton(defaultHref: string | undefined = "/"): NixTemplate {
  return {
    __isNixTemplate: true as const,
    mount(container) {
      const el = typeof container === "string" ? document.querySelector(container)! : container;
      const cleanup = this._render(el, null);
      return { unmount: cleanup };
    },
    _render(parent: Node, before: Node | null): () => void {
      const btn = document.createElement("ion-back-button");
      if (defaultHref) btn.setAttribute("default-href", defaultHref);
      parent.insertBefore(btn, before);
      return () => btn.remove();
    },
  };
}

// --------------------------------------------------------------------------
// Tipos públicos
// --------------------------------------------------------------------------

export interface PageContext {
  lc:     PageLifecycle;
  params: Record<string, string>;
}

export interface RouteDefinition {
  path:      string;
  component: (ctx: PageContext) => NixComponent | NixTemplate;
}

// --------------------------------------------------------------------------
// IonRouterOutlet (El Bridge Maestro usando Framework Delegate)
// --------------------------------------------------------------------------

export class IonRouterOutlet extends NixComponent {
  private routes: RouteDefinition[];

  constructor(routes: RouteDefinition[]) {
    super();
    this.routes = routes;
  }

  // Crea un ID único interno para mapear la ruta
  private _pathToRouteId(path: string): string {
    if (!path || path === "/") return "nix-route-home";
    const clean = path
      .replace(/\/:?[^/]+/g, (m) => "-" + m.replace(/\//g, "").replace(/:/g, ""))
      .replace(/^\//, "")
      .replace(/\//g, "-");
    return `nix-route-${clean}`;
  }

  override render(): NixTemplate {
    const self = this;
    return {
      __isNixTemplate: true as const,
      mount(container: Element | string) {
        const el = typeof container === "string" ? document.querySelector(container)! : container;
        const cleanup = this._render(el, null);
        return { unmount: cleanup };
      },
      _render(parent: Node, before: Node | null): () => void {
        
        const routerEl = document.createElement("ion-router");
        routerEl.setAttribute("use-hash", "false");
        
        // Creamos los <ion-route> asociados a un Component ID en vez de un Custom Element
        self.routes.filter((r) => r.path !== "*").forEach((r) => {
          const routeEl = document.createElement("ion-route");
          routeEl.setAttribute("url", r.path);
          routeEl.setAttribute("component", self._pathToRouteId(r.path));
          routerEl.appendChild(routeEl);
        });

        const outletEl = document.createElement("ion-router-outlet");

        // 🔥 INVERSIÓN DE CONTROL: Framework Delegate 🔥
        (outletEl as any).delegate = {
          // Ionic llama a attachViewToDom cuando debe instanciar una vista nueva o usar caché
          attachViewToDom: async (container: HTMLElement, componentTag: string, props: any, classes: string[]) => {
            
            const routeDef = self.routes.find(r => self._pathToRouteId(r.path) === componentTag);
            
            // Requisito de Ionic: la vista debe ser un elemento con clase .ion-page
            const pageEl = document.createElement("ion-page");
            pageEl.classList.add("ion-page");
            if (classes && classes.length) pageEl.classList.add(...classes);

            // 1. Escuchar los eventos DOM nativos que dispara el outlet
            const lc = createPageLifecycle();
            pageEl.addEventListener("ionViewWillEnter", () => lc.willEnter.update((n) => n + 1));
            pageEl.addEventListener("ionViewDidEnter",  () => lc.didEnter.update((n) => n + 1));
            pageEl.addEventListener("ionViewWillLeave", () => lc.willLeave.update((n) => n + 1));
            pageEl.addEventListener("ionViewDidLeave",  () => lc.didLeave.update((n) => n + 1));

            if (routeDef) {
              // 2. Props entregadas DIRECTAMENTE por Ionic (contiene los Params de la ruta)
              const params = props || {};
              
              // 3. Renderizado agnóstico mediante Nix.js
              const pageNode = routeDef.component({ lc, params });

              if ("render" in pageNode && typeof (pageNode as NixComponent).render === "function") {
                const comp = pageNode as NixComponent;
                comp.onInit?.();
                const renderCleanup = comp.render()._render(pageEl, null);
                const mountRet = comp.onMount?.();

                // Registrar en el nodo DOM cómo debe Nix limpiar esta vista
                (pageEl as any)._nixCleanup = () => {
                  comp.onUnmount?.();
                  if (typeof mountRet === "function") mountRet();
                  renderCleanup();
                };
              } else {
                const renderCleanup = (pageNode as NixTemplate)._render(pageEl, null);
                (pageEl as any)._nixCleanup = renderCleanup;
              }
            }

            container.appendChild(pageEl);
            return pageEl;
          },
          // Ionic llama a removeViewFromDom cuando el usuario navega hacia atrás y se destruye el caché
          removeViewFromDom: async (_container: HTMLElement, component: HTMLElement) => {
            if ((component as any)._nixCleanup) {
              (component as any)._nixCleanup(); // 🧹 Destrucción Segura de Effects (Memory Leaks evitados)
            }
            component.remove();
          }
        };

        parent.insertBefore(routerEl, before);
        parent.insertBefore(outletEl, before);

        return () => {
          routerEl.remove();
          outletEl.remove();
        };
      },
    };
  }
}