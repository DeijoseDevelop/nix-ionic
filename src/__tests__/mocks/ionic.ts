export class MockIonApp extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define("ion-app", MockIonApp);

export class MockIonRouterOutlet extends HTMLElement {
    delegate: any;
    private _commitCount = 0;

    constructor() {
        super();
    }

    get commitCount() {
        return this._commitCount;
    }

    async commit(
        enteringEl: HTMLElement,
        leavingEl: HTMLElement | null,
        opts: { duration?: number; direction?: string; showGoBack?: boolean; animationBuilder?: any } = {},
    ): Promise<void> {
        this._commitCount++;
        this.delegate?.attachViewToDom?.(this, enteringEl);
        if (opts.duration === 0) {
            if (leavingEl) this.delegate?.removeViewFromDom?.(this, leavingEl);
            return;
        }
        // Simulate async animation and lifecycle events
        await Promise.resolve();
        if (leavingEl) {
            leavingEl.dispatchEvent(
                new CustomEvent("ionViewWillLeave", { bubbles: true, composed: true }),
            );
        }
        enteringEl.dispatchEvent(
            new CustomEvent("ionViewWillEnter", { bubbles: true, composed: true }),
        );
        await Promise.resolve();
        enteringEl.dispatchEvent(
            new CustomEvent("ionViewDidEnter", { bubbles: true, composed: true }),
        );
        if (leavingEl) {
            leavingEl.dispatchEvent(
                new CustomEvent("ionViewDidLeave", { bubbles: true, composed: true }),
            );
            this.delegate?.removeViewFromDom?.(this, leavingEl);
        }
    }
}

customElements.define("ion-router-outlet", MockIonRouterOutlet);

export class MockIonBackButton extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define("ion-back-button", MockIonBackButton);

export class MockIonIcon extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define("ion-icon", MockIonIcon);

export class MockIonPage extends HTMLElement {
    constructor() {
        super();
        this.classList.add("ion-page");
    }
}

customElements.define("ion-page", MockIonPage);

export class MockIonHeader extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-header", MockIonHeader);

export class MockIonToolbar extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-toolbar", MockIonToolbar);

export class MockIonTitle extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-title", MockIonTitle);

export class MockIonContent extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-content", MockIonContent);

export class MockIonFooter extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-footer", MockIonFooter);

export class MockIonButtons extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-buttons", MockIonButtons);

export class MockIonTabBar extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-tab-bar", MockIonTabBar);

export class MockIonTabButton extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-tab-button", MockIonTabButton);

export class MockIonLabel extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-label", MockIonLabel);

export class MockIonTabs extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-tabs", MockIonTabs);

export class MockIonTab extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-tab", MockIonTab);

export class MockIonButton extends HTMLElement {
    constructor() {
        super();
    }
}
customElements.define("ion-button", MockIonButton);

export function registerMockIonicElements() {
    // Custom elements are already registered at module load time.
    // This function exists so tests can explicitly import the side effect.
}
