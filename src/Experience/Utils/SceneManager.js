import config from "../Scenes/config";

export default class SceneManager {
  constructor() {
    this.scenes = config;

    //lowercase the keys
    for (let key in this.scenes) {
      this.scenes[key.toLowerCase()] = this.scenes[key];
    }

    // get url params
    this.urlParams = new URLSearchParams(window.location.search);
    this.sceneName = this.urlParams.get("scene");

    // if scene name is not in the list, set it to main
    if (!this.scenes[this.sceneName]) {
      this.sceneName = "main";
    }

    // create scene
    return new this.scenes[this.sceneName]();
  }
}
