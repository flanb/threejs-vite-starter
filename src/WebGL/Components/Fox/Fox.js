import Experience from "webgl/Experience.js";
import { AnimationMixer, Mesh } from "three";
import cloneGltf from "utils/GltfClone.js";

export default class Fox {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;
    this.time = this.experience.time;

    // Resource
    this.resource = this.resources.items.foxModel;

    this.setModel();
    this.setAnimation();
    if (this.debug.active) this.setDebug();
  }

  setModel() {
    this.model = cloneGltf(this.resource).scene;
    this.model.scale.set(0.02, 0.02, 0.02);
    this.model.name = "fox";
    this.scene.add(this.model);

    this.model.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
      }
    });
  }

  setAnimation() {
    this.animation = {};

    // Mixer
    this.animation.mixer = new AnimationMixer(this.model);

    // Actions
    this.animation.actions = {};

    this.animation.actions.idle = this.animation.mixer.clipAction(
      this.resource.animations[0]
    );
    this.animation.actions.walking = this.animation.mixer.clipAction(
      this.resource.animations[1]
    );
    this.animation.actions.running = this.animation.mixer.clipAction(
      this.resource.animations[2]
    );

    this.animation.actions.current = this.animation.actions.idle;
    this.animation.actions.current.play();

    // Play the action
    this.animation.play = (name) => {
      const newAction = this.animation.actions[name];
      const oldAction = this.animation.actions.current;

      newAction.reset();
      newAction.play();
      newAction.crossFadeFrom(oldAction, 1);

      this.animation.actions.current = newAction;
    };
  }

  setDebug() {
    if (
      this.debug.ui.children
        .map((child) => child.title)
        .includes(this.model.name)
    ) {
      //singleton

      this.debugFolder = this.debug.ui.children.find(
        (child) => child.title === this.model.name
      );
      console.log(this.debugFolder);
      const Tab = this.debugFolder.addTab({ pages: [{ title: "1" }] });
      Tab.children;
      this.debugFolder.children = [];
    } else {
      this.debugFolder = this.debug.ui.addFolder({
        title: this.model.name,
      });
    }

    // const tab = this.debugFolder.addTab({
    //   pages: [{ title: "1" }],
    // });
    //
    // tab.addPage({ title: "2" });

    const debugObject = {
      playIdle: () => {
        this.animation.play("idle");
      },
      playWalking: () => {
        this.animation.play("walking");
      },
      playRunning: () => {
        this.animation.play("running");
      },
    };

    this.debugFolder.addInput(this.model, "position", { label: "position" });

    this.debugFolder
      .addButton({ title: "playIdle", label: "playIdle" })
      .on("click", debugObject.playIdle);
    this.debugFolder
      .addButton({ title: "playWalking", label: "playWalking" })
      .on("click", debugObject.playWalking);
    this.debugFolder
      .addButton({ title: "playRunning", label: "playRunning" })
      .on("click", debugObject.playRunning);
  }

  update() {
    this.animation.mixer.update(this.time.delta * 0.001);
  }
}
