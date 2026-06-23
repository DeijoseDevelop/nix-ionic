/**
 * @deijose/nix-ionic / tabs.ts  —  v2
 *
 * Bottom tab bar that drives navigation through the core router. The visual
 * "active" state is computed from `nixRouter().current` directly.
 *
 * Tab switches are intentionally direction:"none" — Ionic's convention is no
 * animation between tabs. Per-tab stacks (configured on IonRouterOutlet via
 * `tabs: [...]`) preserve each tab's deep view across switches.
 */

import { html } from "@deijose/nix-js";
import type { NixTemplate } from "@deijose/nix-js";
import { nixRouter, type NavigationDirection } from "@deijose/nix-js";

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
    /**
     * Direction passed to the router on tab change.
     * Default `"none"` — no animation, native Ionic feel.
     */
    navigationDirection?: NavigationDirection;
    hideWhen?: (path: string) => boolean;
}

function _normalizePath(p: string): string {
    if (!p || p === "/") return "/";
    return p.endsWith("/") ? p.slice(0, -1) : p;
}

function _isActive(tab: BottomTabItem, currentPath: string): boolean {
    const cur = _normalizePath(currentPath);
    const tgt = _normalizePath(tab.path);
    if (tab.exact) return cur === tgt;
    if (tgt === "/") return cur === "/";
    return cur === tgt || cur.startsWith(`${tgt}/`);
}

function _isHidden(path: string, patterns?: string[]): boolean {
    if (!patterns?.length) return false;
    const cur = _normalizePath(path);
    return patterns.some((pat) => {
        const norm = _normalizePath(pat);
        if (norm.endsWith("/*")) {
            const base = norm.slice(0, -2);
            return cur === base || cur.startsWith(`${base}/`);
        }
        return cur === norm;
    });
}

export function createBottomTabBar(
    tabs: BottomTabItem[],
    options: BottomTabBarOptions = {},
): NixTemplate {
    const router = nixRouter();
    const slot = options.slot ?? "bottom";
    const className = options.className ?? "nix-ion-tab-bar";
    const activeClassName = options.activeClassName ?? "tab-selected";
    const direction: NavigationDirection = options.navigationDirection ?? "none";

    return html`
    <ion-tab-bar
      slot=${slot}
      class=${className}
      style=${() => {
            const path = router.current.value;
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
            class=${() => (_isActive(tab, router.current.value) ? activeClassName : "")}
            @click=${() => {
                    // If we're already on this tab's tree, going to its root
                    // is a "back to root" — use replace to avoid stack growth.
                    if (_isActive(tab, router.current.value)) {
                        router.replace(tab.path, { direction: "none" });
                    } else {
                        router.navigate(tab.path, { direction });
                    }
                }}
          >
            ${tab.icon
                    ? html`
                  <ion-icon
                    name=${() => {
                            const active = _isActive(tab, router.current.value);
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