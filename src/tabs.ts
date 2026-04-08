import { html } from "@deijose/nix-js";
import type { NixTemplate } from "@deijose/nix-js";
import { useRouter } from "./IonRouterOutlet";

export interface BottomTabItem {
    path: string;
    label: string;
    icon?: string;
    activeIcon?: string;
    exact?: boolean;
    tabId?: string;
}

export interface BottomTabBarOptions {
    slot?: "top" | "bottom";
    className?: string;
    activeClassName?: string;
    hiddenPaths?: string[];
    navigationDirection?: "forward" | "back" | "root";
    hideWhen?: (path: string) => boolean;
}

function _normalizePath(path: string): string {
    if (!path) return "/";
    if (path === "/") return "/";
    return path.endsWith("/") ? path.slice(0, -1) : path;
}

function _isActive(tab: BottomTabItem, currentPath: string): boolean {
    const current = _normalizePath(currentPath);
    const target = _normalizePath(tab.path);

    if (tab.exact) return current === target;
    if (target === "/") return current === "/";
    return current === target || current.startsWith(`${target}/`);
}

function _isHidden(path: string, hiddenPaths?: string[]): boolean {
    if (!hiddenPaths || hiddenPaths.length === 0) return false;

    const current = _normalizePath(path);
    return hiddenPaths.some((pattern) => {
        const normalized = _normalizePath(pattern);
        if (normalized.endsWith("/*")) {
            const base = normalized.slice(0, -2);
            return current === base || current.startsWith(`${base}/`);
        }
        return current === normalized;
    });
}

export function createBottomTabBar(
    tabs: BottomTabItem[],
    options: BottomTabBarOptions = {},
): NixTemplate {
    const router = useRouter();
    const slot = options.slot ?? "bottom";
    const className = options.className ?? "nix-ion-tab-bar";
    const activeClassName = options.activeClassName ?? "tab-selected";
    const direction = options.navigationDirection ?? "root";

    return html`
    <ion-tab-bar
      slot=${slot}
      class=${className}
      style=${() => {
            const path = router.path.value;
            const hidden = options.hideWhen
                ? options.hideWhen(path)
                : _isHidden(path, options.hiddenPaths);
            return hidden ? "display:none" : "";
        }}
    >
      ${tabs.map((tab) => {
            const computedTabId = _normalizePath(tab.path).replace(/\//g, "-");
            const tabId = tab.tabId ?? (computedTabId || "root");

            return html`
          <ion-tab-button
            tab=${tabId}
            class=${() => (_isActive(tab, router.path.value) ? activeClassName : "")}
            @click=${() => router.navigate(tab.path, direction)}
          >
            ${tab.icon
                    ? html`
                  <ion-icon
                    name=${() => {
                            const active = _isActive(tab, router.path.value);
                            return active && tab.activeIcon ? tab.activeIcon : tab.icon;
                        }}
                  ></ion-icon>
                `
                    : ""}
            <ion-label>${tab.label}</ion-label>
          </ion-tab-button>
        `;
        })}
    </ion-tab-bar>
  `;
}
