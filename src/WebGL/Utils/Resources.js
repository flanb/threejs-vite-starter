import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import EventEmitter from "./EventEmitter.js";
import { CubeTextureLoader, TextureLoader } from "three";
import Experience from "webgl/Experience.js";

export default class Resources extends EventEmitter {
  constructor(sources) {
    super();

    this.experience = new Experience();
    this.debug = this.experience.debug;

    this.sources = sources;

    this.items = {};
    this.toLoad = this.sources.length;
    this.loaded = 0;

    if (this.debug.debugParams?.LoadingScreen) this.setLoadingScreen();
    this.setLoaders();
    this.startLoading();
  }

  setLoadingScreen() {
    const loadingScreenStyles = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "#000",
      zIndex: 100,
    };
    const loadingBarStyles = {
      position: "fixed",
      top: "50%",
      left: "25%",
      width: "50%",
      margin: "auto",
      height: "2px",
      background: "white",
      zIndex: 100,
      transformOrigin: "left",
      transform: "scaleX(0)",
    };
    this.loadingScreenElement = document.createElement("div");
    Object.assign(this.loadingScreenElement.style, loadingScreenStyles);
    this.loadingBarElement = document.createElement("div");
    Object.assign(this.loadingBarElement.style, loadingBarStyles);
    this.loadingScreenElement.appendChild(this.loadingBarElement);
    document.body.appendChild(this.loadingScreenElement);
  }

  setLoaders() {
    this.loaders = {};
    this.loaders.gltfLoader = new GLTFLoader();
    this.loaders.textureLoader = new TextureLoader();
    this.loaders.cubeTextureLoader = new CubeTextureLoader();
  }

  startLoading() {
    if (this.debug.active) console.debug("⏳ Loading resources...");
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

    if (this.debug.active)
      console.debug(
        `🖼️ ${source.name} loaded. (${this.loaded}/${this.toLoad})`
      );

    if (this.debug.debugParams?.LoadingScreen) {
      this.loadingBarElement.style.transform = `scaleX(${
        this.loaded / this.toLoad
      })`;
    }

    if (this.loaded === this.toLoad) {
      if (this.debug.active) console.debug("✅ Resources loaded!");
      if (this.debug.debugParams?.LoadingScreen)
        this.loadingScreenElement.remove();
      this.trigger("ready");
    }
  }
}
