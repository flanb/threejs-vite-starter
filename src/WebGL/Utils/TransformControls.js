import Experience from 'webgl/Experience.js'
import { TransformControls as THREETransformControls } from 'three/addons/controls/TransformControls.js'
import EventEmitter from 'utils/EventEmitter.js'

let instance = null

export default class TransformControls extends EventEmitter {
	constructor() {
		super()
		// Singleton
		if (instance) {
			return instance
		}
		instance = this

		this.experience = new Experience()

		this.setInstance()
	}

	setInstance() {
		this.instance = new THREETransformControls(this.experience.camera.instance, this.experience.canvas)

		this.instance.addEventListener('change', () => {
			this.trigger('change')
		})

		let controlsIsEnable
		this.instance.addEventListener('dragging-changed', ({ value }) => {
			if (value) {
				controlsIsEnable = this.experience.camera.controls.enabled
				this.experience.camera.controls.enabled = !value
			} else {
				if (controlsIsEnable) {
					this.experience.camera.controls.enabled = !value
				}
			}
		})
		this.instance.name = 'transformControl'
		this.experience.scene.add(this.instance)
	}
}
