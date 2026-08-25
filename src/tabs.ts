/**
 * @deijose/nix-ionic / tabs.ts  —  v2
 *
 * Bottom tab bar that drives navigation through the core router. The visual
 * "active" state is computed from `nixRouter().current` directly.
 *
 * Tab switches are intentionally direction:"none" — Ionic's convention is no
 * animation between tabs. Per-tab stacks (configured on IonRouterOutlet via
 * `tabs: [...]`) preserve each tab's deep view across switches.
 *
 * v2.0.2 fix: The tab bar is now wrapped in <ion-tabs> which provides the
 * correct CSS layout context (position: absolute for the outlet, slot="bottom"
 * for the tab bar). Without <ion-tabs>, ion-tab-bar has no positioning and
 * appears at the top of the flex flow, and ion-router-outlet (position:absolute;
 * inset:0) covers it completely.
 *
 * ion-tabs is a pure layout container in Ionic Core — it does NOT do routing.
 * Routing is handled by ion-router-outlet inside it. ion-tabs only provides:
 *   - display: flex; flex-direction: column
 *   - .tabs-inner { flex: 1; position: relative } for the default slot
 *   - <slot name="bottom"> for the tab bar
 */

import { html, NixComponent } from "@deijose/nix-js";
import type { NixTemplate } from "@deijose/nix-js";
import { nixRouter, type NavigationDirection } from "@deijose/nix-js";
import { addIcons, type IconDefinitionMap } from "./setup.js";

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
    /**
     * Icon SVG data to register for the tab bar icons.
     *
     * The Vite plugin can only detect static `name="icon-name"` in html``
     * templates. Tab bar icons are dynamic (`name=${() => tab.icon}`), so
     * the plugin can't detect them. Pass the icon data here and
     * `createBottomTabBar` will call `addIcons()` internally.
     *
     * @example
     * ```ts
     * import { home, search, person, settings } from "ionicons/icons";
     *
     * createBottomTabBar(tabs, {
     *   icons: { home, search, person, settings },
     * });
     * ```
     */
    icons?: IconDefinitionMap;
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

    // Register icons if provided. The Vite plugin can't detect dynamic
    // icon names (name=${() => tab.icon}), so the consumer must pass
    // the icon SVG data via the `icons` option.
    if (options.icons) {
        addIcons(options.icons);
    }

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
            const computedTabId = tab.path === "/"
                ? ""
                : _normalizePath(tab.path).replace(/\//g, "-");
            const tabId = tab.tabId ?? (computedTabId || "root");

            return html`
          <ion-tab-button
            tab=${tabId}
            layout="icon-top"
            class=${() => (_isActive(tab, router.current.value) ? activeClassName : "")}
            .selected=${() => _isActive(tab, router.current.value)}
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

/**
 * Wraps an IonRouterOutlet and a tab bar in <ion-tabs>, providing the
 * correct CSS layout context.
 *
 * <ion-tabs> is a pure layout container in Ionic Core:
 *   - display: flex; flex-direction: column
 *   - .tabs-inner { flex: 1; position: relative } → outlet goes here
 *   - <slot name="bottom"> → tab bar goes here
 *
 * Without <ion-tabs>, ion-tab-bar has no positioning (it relies on
 * ion-tabs for position:absolute; bottom:0), and ion-router-outlet
 * (position:absolute; inset:0) covers the tab bar completely.
 *
 * @example
 * ```ts
 * const tabBar = createBottomTabBar(tabs, { icons: { home, search } });
 * const layout = createTabsLayout(outlet, tabBar);
 * mount(new App(layout), "#app");
 * ```
 */
export function createTabsLayout(
    outlet: NixTemplate | NixComponent,
    tabBar: NixTemplate,
): NixTemplate {
    // IonRouterOutlet extends NixComponent, which is not a NixTemplate.
    // NixComponent has a render() method that returns a NixTemplate.
    // When given a NixComponent, we call render() to get the template.
    const outletTemplate = outlet instanceof NixComponent ? outlet.render() : outlet;
    return html`
        <ion-tabs>
            ${outletTemplate}
            ${tabBar}
        </ion-tabs>
    `;
}
