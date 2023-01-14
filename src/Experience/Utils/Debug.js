import { Pane } from "tweakpane";

export default class Debug {
  constructor() {
    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.ui = new Pane();

      // debug message when something is added to the scene
      window.experience.scene.add = (function (original) {
        return function (object) {
          console.debug(
            `📦 ${
              object.name ? object.name : `unnamed ${object.type}`
            } added to the scene`,
            object
          );
          return original.apply(this, arguments);
        };
      })(window.experience.scene.add);
    }
  }
}
