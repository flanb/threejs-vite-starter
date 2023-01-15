import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import EventEmitter from "./EventEmitter.js";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.sources = sources;

    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    this.setLoaders();
    this.startLoading();
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.textureLoader = new THREE.TextureLoader();
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  startLoading() {
    if (window.experience.debug.active)
      console.debug("⏳ Loading resources...");
    // Load each source
    for (const source of this.sources) {
      switch (source.type) {
        case "gltf":
          this.loaders.gltfLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file);
          });
          break;
        case "texture":
          this.loaders.textureLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file);
          });
          break;
        case "cubeTexture":
          this.loaders.cubeTextureLoader.load(source.path, (file) => {
            this.sourceLoaded(source, file);
          });
          break;
        default:
          console.error(source.type + " is not a valid source type");
          break;
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file;
    this.loaded++;

    if (window.experience.debug.active)
      console.debug(
        `🖼️ ${source.name} loaded. (${this.loaded}/${this.toLoad})`
      );

    if (this.loaded === this.toLoad) {
      if (window.experience.debug.active) console.debug("✅ Resources loaded!");
      this.trigger("ready");
    }
  }
}
