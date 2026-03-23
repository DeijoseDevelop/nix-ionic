/**
 * ionic-nix/lifecycle.ts
 *
 * Sistema de ciclo de vida de navegación, análogo a los hooks de Ionic:
 *   ionViewWillEnter / ionViewDidEnter / ionViewWillLeave / ionViewDidLeave
 *
 * Cómo funciona (sin provide/inject):
 *   1. IonRouterOutlet crea un `PageLifecycle` por cada ruta.
 *   2. Lo pasa directamente al factory de la ruta como argumento.
 *   3. El factory llama a `new MiPagina(lc)` o `MiPagina(lc)`.
 *   4. IonPage/composables registran watchers sobre las señales del lc.
 *   5. Cuando el router navega, incrementa las señales → watchers se disparan.
 */

import { signal, watch } from "@deijose/nix-js";
import type { Signal } from "@deijose/nix-js";
import { NixComponent } from "@deijose/nix-js";

// --------------------------------------------------------------------------
// Tipos públicos
// --------------------------------------------------------------------------

export interface PageLifecycle {
  willEnter: Signal<number>;
  didEnter:  Signal<number>;
  willLeave: Signal<number>;
  didLeave:  Signal<number>;
}

/** Crea un nuevo PageLifecycle con señales en 0. */
export function createPageLifecycle(): PageLifecycle {
  return {
    willEnter: signal(0),
    didEnter:  signal(0),
    willLeave: signal(0),
    didLeave:  signal(0),
  };
}

// --------------------------------------------------------------------------
// IonPage — clase base para páginas con hooks de navegación
// --------------------------------------------------------------------------
//
// Uso:
//   class HomePage extends IonPage {
//     constructor(lc: PageLifecycle) { super(lc); }
//
//     ionViewWillEnter() { /* fetch de datos frescos */ }
//     render() { return html`...`; }
//   }

export abstract class IonPage extends NixComponent {
  private __lc: PageLifecycle;

  constructor(lc: PageLifecycle) {
    super();
    this.__lc = lc;
  }

  override onInit(): void {
    const lc = this.__lc;
    // watch no corre en init (immediate: false), así que ionViewWillEnter
    // solo se llama cuando el outlet incrementa la señal, no al construir.
    if (this.ionViewWillEnter) watch(lc.willEnter, this.ionViewWillEnter.bind(this));
    if (this.ionViewDidEnter)  watch(lc.didEnter,  this.ionViewDidEnter.bind(this));
    if (this.ionViewWillLeave) watch(lc.willLeave, this.ionViewWillLeave.bind(this));
    if (this.ionViewDidLeave)  watch(lc.didLeave,  this.ionViewDidLeave.bind(this));
  }

  ionViewWillEnter?(): void;
  ionViewDidEnter?():  void;
  ionViewWillLeave?(): void;
  ionViewDidLeave?():  void;
}

// --------------------------------------------------------------------------
// Composables para function components
// --------------------------------------------------------------------------
//
// Uso:
//   function ProfilePage(lc: PageLifecycle): NixTemplate {
//     useIonViewWillEnter(lc, () => { /* fetch */ });
//     return html`...`;
//   }

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