import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import Stats from "stats.js";
import Experience from "webgl/Experience";

export default class Debug {
  constructor() {
    this.experience = new Experience();
    this.active = window.location.hash === "#debug";

    if (this.active) {
      this.ui = new Pane({ title: "⚙️ Debug" });

      this.setPlugins();
      this.setImportExportButtons();
      this.setMoveEvent();

      this.setDebugManager();

      if (this.debugParams.SceneLog) this.setSceneLog();
      if (this.debugParams.Stats) this.setStats();
    }
  }

  setPlugins() {
    this.ui.registerPlugin(EssentialsPlugin);
  }

  setImportExportButtons() {
    const handleExport = () => {
      const data = this.ui.exportPreset();
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      element.href = URL.createObjectURL(file);
      element.download = "preset.json";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      element.remove();
    };

    const handleImport = () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = JSON.parse(event.target.result);
          this.ui.importPreset(data);
        };
        reader.readAsText(file);
      };
      input.click();
    };

    this.ui
      .addBlade({
        view: "buttongrid",
        size: [2, 1],
        cells: (x, y) => ({
          title: [["Import", "Export"]][y][x],
        }),
      })
      .on("click", (event) => {
        if (event.index[0] === 0) {
          handleImport();
          return;
        }
        handleExport();
      });
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

  setDebugManager() {
    this.debugParams = {
      SceneLog: true,
      Stats: true,
      LoadingScreen: true,
    };
    this.debugParams =
      JSON.parse(sessionStorage.getItem("debugParams")) || this.debugParams;

    const debugManager = this.ui.addFolder({
      title: "Debug Feature Manager",
      expanded: false,
    });

    const handleReset = () => {
      Object.keys(this.debugParams).forEach((key, index) => {
        this.debugParams[key] = true;
        debugManager.children[index + 1].refresh();
      });
    };

    debugManager
      .addButton({ title: "Reset Debug Manager" })
      .on("click", handleReset);

    Object.keys(this.debugParams).forEach((key) => {
      debugManager.addInput(this.debugParams, key).on("change", ({ value }) => {
        sessionStorage.setItem("debugParams", JSON.stringify(this.debugParams));
        if (value) {
          if (this[`set${key}`]) this[`set${key}`]();
        } else {
          if (this[`unset${key}`]) this[`unset${key}`]();
        }
      });
    });
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
    this.statsJsPanel = new Stats();
    document.body.appendChild(this.statsJsPanel.domElement);
    const monitoringValues = [
      {
        name: "Calls",
        value: () => this.experience.renderer.instance.info.render.calls,
      },
      {
        name: "Triangles",
        value: () => this.experience.renderer.instance.info.render.triangles,
      },
      {
        name: "Lines",
        value: () => this.experience.renderer.instance.info.render.lines,
      },
      {
        name: "Points",
        value: () => this.experience.renderer.instance.info.render.points,
      },
      {
        name: "Geometries",
        value: () => this.experience.renderer.instance.info.memory.geometries,
      },
      {
        name: "Materials",
        value: () => this.experience.renderer.instance.info.programs.length,
      },
      {
        name: "Textures",
        value: () => this.experience.renderer.instance.info.memory.textures,
      },
    ];

    this.monitoringSection = document.createElement("section");
    Object.assign(this.monitoringSection.style, {
      position: "absolute",
      bottom: "1rem",
      left: "1rem",
      pointerEvents: "none",
      color: "white",
      zIndex: "1000",
      display: "flex",
      gap: "1rem",
      fontSize: "12px",
    });

    monitoringValues.forEach((monitoringValue) => {
      const monitoringValueElement = document.createElement("span");
      monitoringValueElement.id = monitoringValue.name.toLowerCase();
      monitoringValue.element = monitoringValueElement;
      this.monitoringSection.appendChild(monitoringValueElement);
    });

    document.body.appendChild(this.monitoringSection);

    this.stats = {
      monitoringValues,
      update: () => {
        this.statsJsPanel.update();
        monitoringValues.forEach((monitoringValue) => {
          if (monitoringValue.value() === monitoringValue.lastValue) return;
          monitoringValue.lastValue = monitoringValue.value();
          monitoringValue.element.innerHTML = `<b>${monitoringValue.lastValue}</b> ${monitoringValue.name}`;
        });
      },
    };
  }
  unsetStats() {
    this.statsJsPanel.domElement.remove();
    this.monitoringSection.remove();
  }

  update() {
    if (this.active) {
      if (this.debugParams.Stats) this.stats.update();
    }
  }
}
