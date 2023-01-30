import { Pane } from "tweakpane";
import Stats from "stats.js";
import Experience from "webgl/Experience";

export default class Debug {
  constructor() {
    this.experience = new Experience();
    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.ui = new Pane({ title: "⚙️ Debug" });

      this.setSceneLog();
      this.setStats();
      this.setMoveEvent();
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

  setMoveEvent() {
    const container = this.ui.containerElem_;
    const titleElement = this.ui.element.children[0];
    titleElement.childNodes.forEach((child) => {
      child.style.pointerEvents = "none";
    });

    let move = () => {};
    const handleMouseDown = (event) => {
      titleElement.style.cursor = "grabbing";
      const clickTargetX = event.layerX;
      const clickTargetWidth = event.target.clientWidth;
      const clickTargetY = event.layerY;

      move = (event) => {
        const x = event.clientX;
        const y = event.clientY;

        container.style.right = `${
          innerWidth - x - (clickTargetWidth - clickTargetX)
        }px`;
        container.style.top = `${y - clickTargetY}px`;
      };

      document.addEventListener("mousemove", move);
    };
    const handleMouseUp = () => {
      titleElement.style.cursor = null;

      document.removeEventListener("mousemove", move);
    };

    titleElement.addEventListener("mousedown", handleMouseDown);
    titleElement.addEventListener("mouseup", handleMouseUp);
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
