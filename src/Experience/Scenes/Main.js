import Experience from "../Experience.js";
import Environment from "../Components/Environment.js";
import Floor from "../Components/Floor.js";
import Fox from "../Components/Fox.js";
import Cube from "../Components/Cube/Cube.js";

export default class Main {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      // Setup
      this.floor = new Floor();
      this.fox = new Fox();
      this.cube = new Cube();
      this.environment = new Environment();
    });
  }

  update() {
    if (this.fox) this.fox.update();
  }
}
