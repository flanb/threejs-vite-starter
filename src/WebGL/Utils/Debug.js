import { Pane } from "tweakpane";
import Stats from "stats.js";
import Experience from "webgl/Experience";

export default class Debug {
  constructor() {
    this.experience = new Experience();
    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.ui = new Pane();
      this.setSceneLog();
      this.setStats();
    }
  }

  setSceneLog() {
    // debug message when something is added to the scene
    this.experience.scene.add = (function (original) {
      return function (object) {
        console.debug(
          `📦 ${
            object.name ? object.name : `unnamed ${object.type}`
          } added to the scene`,
          object
        );
        return original.apply(this, arguments);
      };
    })(this.experience.scene.add);
  }

  setStats() {
    this.stats = new Stats();
    //draw call panel
    this.drawCallPanel = this.stats.addPanel(
      new Stats.Panel("DCALLS", "#ff8", "#221")
    );
    this.stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom

    document.body.appendChild(this.stats.dom);
  }

  update() {
    if (this.active) {
      this.stats.update();
      this.drawCallPanel.update(
        this.experience.renderer.instance.info.render.calls,
        200
      );
    }
  }
}
