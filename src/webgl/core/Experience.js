import Debug from 'core/Debug.js'
import Sizes from 'core/Sizes.js'
import Time from 'core/Time.js'
import Camera from 'core/Camera.js'
import Renderer from './Renderer.js'
import SceneManager from 'core/SceneManager.js'
import { Mesh, Scene } from 'three'
import InteractionManager from 'core/InteractionManager.js'

let instance = null

export default class Experience {
	constructor(_canvas) {
		// Singleton
		if (instance) {
			return instance
		}
		instance = this

		// Global access
		window.experience = this

		// Options
		this.canvas = _canvas

		// Setup
		this.sizes = new Sizes()
		this.time = new Time()
		this.scene = new Scene()
		this.debug = new Debug()
		this.camera = new Camera()
		this.interactionManager = new InteractionManager(this.camera.instance)
		this.activeScene = new SceneManager()
		this.renderer = new Renderer()

		// Resize event
		this.sizes.on('resize', () => {
			this.resize()
		})

		// Time tick event
		this.time.on('tick', () => {
			this.update()
		})
	}

	resize() {
		this.camera.resize()
		this.renderer.resize()
	}

	update() {
		if (this.activeScene.update) this.activeScene.update()
		this.renderer.update()
		this.debug.update()
		this.interactionManager.update()
	}

	destroy() {
		this.sizes.off('resize')
		this.time.off('tick')

		// Traverse the whole scene
		this.scene.traverse((child) => {
			// Test if it's a mesh
			if (child instanceof Mesh) {
				child.geometry.dispose()

				// Loop through the material properties
				for (const key in child.material) {
					const value = child.material[key]

					// Test if there is a dispose function
					if (value && typeof value.dispose === 'function') {
						value.dispose()
					}
				}
			}
		})

		this.camera.dispose()
		this.renderer.instance.dispose()

		if (this.debug.active) this.debug.ui.destroy()
	}
}
