import Experience from "webgl/Experience.js";
import fragmentShader from "./fragmentShader.frag";
import vertexShader from "./vertexShader.vert";
import { BoxGeometry, Mesh, ShaderMaterial, Vector3 } from "three";

export default class Cube {
  constructor(_position = new Vector3(0, 0, 0)) {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.position = _position;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new BoxGeometry(1, 1, 1);
  }

  setMaterial() {
    this.material = new ShaderMaterial({
      fragmentShader,
      vertexShader,
    });
  }

  setMesh() {
    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.position);
    this.mesh.name = "cube";
    this.scene.add(this.mesh);
  }
}
