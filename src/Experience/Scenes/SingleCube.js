import Experience from "../Experience.js";
import Environment from "../Components/Environment.js";
import Cube from "../Components/Cube/Cube.js";

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
