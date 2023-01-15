import Experience from "../Experience.js";
import {
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  sRGBEncoding,
} from "three";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    // Debug
    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder({ title: "environment" });
    }

    this.setSunLight();
    this.setEnvironmentMap();
  }

  setSunLight() {
    this.sunLight = new DirectionalLight("#ffffff", 4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(3.5, 2, -1.25);
    this.sunLight.name = "sunLight";
    this.scene.add(this.sunLight);

    // Debug
    if (this.debug.active) {
      this.debugFolder.addInput(this.sunLight, "intensity", {
        min: 0,
        max: 10,
        step: 0.001,
        label: "sunLightIntensity",
      });

      this.debugFolder.addInput(this.sunLight.position, "x", {
        min: -5,
        max: 5,
        step: 0.001,
        label: "sunLightX",
      });

      this.debugFolder.addInput(this.sunLight.position, "y", {
        min: -5,
        max: 5,
        step: 0.001,
        label: "sunLightY",
      });

      this.debugFolder.addInput(this.sunLight.position, "z", {
        min: -5,
        max: 5,
        step: 0.001,
        label: "sunLightZ",
      });
    }
  }

  setEnvironmentMap() {
    this.environmentMap = {};
    this.environmentMap.intensity = 0.4;
    this.environmentMap.texture = this.resources.items.environmentMapTexture;
    this.environmentMap.texture.encoding = sRGBEncoding;

    this.scene.environment = this.environmentMap.texture;

    this.environmentMap.updateMaterials = () => {
      this.scene.traverse((child) => {
        if (
          child instanceof Mesh &&
          child.material instanceof MeshStandardMaterial
        ) {
          child.material.envMap = this.environmentMap.texture;
          child.material.envMapIntensity = this.environmentMap.intensity;
          child.material.needsUpdate = true;
        }
      });
    };
    this.environmentMap.updateMaterials();

    // Debug
    if (this.debug.active) {
      this.debugFolder
        .addInput(this.environmentMap, "intensity", {
          min: 0,
          max: 4,
          step: 0.001,
          label: "envMapIntensity",
        })
        .on("change", this.environmentMap.updateMaterials);
    }
  }
}
