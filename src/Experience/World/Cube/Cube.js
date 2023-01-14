import * as THREE from "three";
import Experience from "../../Experience.js";
import fragmentShader from "./fragmentShader.frag";
import vertexShader from "./vertexShader.vert";

export default class Cube {
  constructor(_position = new THREE.Vector3(0, 0, 0)) {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.position = _position;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      fragmentShader,
      vertexShader,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.position);
    this.mesh.name = "cube";
    this.scene.add(this.mesh);
  }
}
