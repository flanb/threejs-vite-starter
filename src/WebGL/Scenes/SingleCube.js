import Experience from "../Experience.js";
import Cube from "components/Cube/Cube.js";

export default class Main {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      // Setup
      this.cube = new Cube();
    });
  }

  update() {}
}
