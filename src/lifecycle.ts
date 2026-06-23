/**
 * @deijose/nix-ionic / lifecycle.ts  —  v2
 *
 * Page-lifecycle plumbing identical to v1. The hooks (ionViewWillEnter,
 * ionViewDidEnter, ionViewWillLeave, ionViewDidLeave) still come from the
 * native <ion-page> element events — IonRouterOutlet attaches the listeners
 * when it creates each page.
 *
 * Nothing here needed to change for the single-router refactor.
 */

import { signal, watch } from "@deijose/nix-js";
import type { Signal } from "@deijose/nix-js";
import { NixComponent } from "@deijose/nix-js";

export interface PageLifecycle {
    willEnter: Signal<number>;
    didEnter: Signal<number>;
    willLeave: Signal<number>;
    didLeave: Signal<number>;
}

export function createPageLifecycle(): PageLifecycle {
    return {
        willEnter: signal(0),
        didEnter: signal(0),
        willLeave: signal(0),
        didLeave: signal(0),
    };
}

/**
 * Class-based pages. Subclass and implement any of the hooks.
 *
 *   class HomePage extends IonPage {
 *     constructor(lc: PageLifecycle) { super(lc); }
 *     ionViewWillEnter() { this.refreshData(); }
 *     render() { return html`...`; }
 *   }
 */
export abstract class IonPage extends NixComponent {
    private __lc: PageLifecycle;

    constructor(lc: PageLifecycle) {
        super();
        this.__lc = lc;
    }

    override onInit(): void {
        const lc = this.__lc;
        if (this.ionViewWillEnter) watch(lc.willEnter, this.ionViewWillEnter.bind(this));
        if (this.ionViewDidEnter) watch(lc.didEnter, this.ionViewDidEnter.bind(this));
        if (this.ionViewWillLeave) watch(lc.willLeave, this.ionViewWillLeave.bind(this));
        if (this.ionViewDidLeave) watch(lc.didLeave, this.ionViewDidLeave.bind(this));
    }

    ionViewWillEnter?(): void;
    ionViewDidEnter?(): void;
    ionViewWillLeave?(): void;
    ionViewDidLeave?(): void;
}

// -----------------------------------------------------------------------------
//  Composables for function-component style pages
// -----------------------------------------------------------------------------

export function useIonViewWillEnter(lc: PageLifecycle, fn: () => void): void {
    watch(lc.willEnter, fn);
}

export function useIonViewDidEnter(lc: PageLifecycle, fn: () => void): void {
    watch(lc.didEnter, fn);
}

export function useIonViewWillLeave(lc: PageLifecycle, fn: () => void): void {
    watch(lc.willLeave, fn);
}

export function useIonViewDidLeave(lc: PageLifecycle, fn: () => void): void {
    watch(lc.didLeave, fn);
}