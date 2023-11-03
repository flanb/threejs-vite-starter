import Experience from 'webgl/Experience.js'
import { AnimationMixer, Mesh } from 'three'
import InputManager from 'utils/InputManager.js'
import addMeshDebug from 'utils/addMeshDebug.js'

export default class Fox {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.experience.resources
		this.debug = this.experience.debug
		this.time = this.experience.time

		// Resource
		this.resource = this.resources.items.foxModel

		this.setModel()
		this.setAnimation()
		this.setInputs()
		if (this.debug.active) this.setDebug()
	}

	setModel() {
		this.model = this.resource.scene
		this.model.scale.set(0.02, 0.02, 0.02)
		this.model.name = 'fox'
		this.scene.add(this.model)

		this.model.traverse((child) => {
			if (child instanceof Mesh) {
				child.castShadow = true
			}
		})
	}

	setAnimation() {
		this.animation = {}

		// Mixer
		this.animation.mixer = new AnimationMixer(this.model)

		// Actions
		this.animation.actions = {}

		this.animation.actions.idle = this.animation.mixer.clipAction(this.resource.animations[0])
		this.animation.actions.walking = this.animation.mixer.clipAction(this.resource.animations[1])
		this.animation.actions.running = this.animation.mixer.clipAction(this.resource.animations[2])

		this.animation.actions.current = this.animation.actions.idle
		this.animation.actions.current.play()

		// Play the action
		this.animation.play = (name) => {
			const newAction = this.animation.actions[name]
			const oldAction = this.animation.actions.current

			newAction.reset()
			newAction.play()
			newAction.crossFadeFrom(oldAction, 1)

			this.animation.actions.current = newAction
		}
	}

	setInputs() {
		let isMoving = false
		InputManager.on('up', (value) => {
			if (value && !isMoving) {
				this.animation.play('walking')
				isMoving = true
			} else if (!value && isMoving) {
				this.animation.play('idle')
				isMoving = false
			}
		})
		InputManager.on('shift', (value) => {
			if (value && isMoving) {
				this.animation.play('running')
			} else if (!value && isMoving) {
				this.animation.play('walking')
			}
		})
	}

	update() {
		if (this.animation) this.animation.mixer.update(this.time.delta * 0.001)
	}

	setDebug() {
		const debugFolder = addMeshDebug(this.debug.ui, this.model)
		const debugObject = {
			playIdle: () => {
				this.animation.play('idle')
			},
			playWalking: () => {
				this.animation.play('walking')
			},
			playRunning: () => {
				this.animation.play('running')
			},
		}
		debugFolder.addButton({ title: 'playIdle', label: 'playIdle' }).on('click', debugObject.playIdle)
		debugFolder.addButton({ title: 'playWalking', label: 'playWalking' }).on('click', debugObject.playWalking)
		debugFolder.addButton({ title: 'playRunning', label: 'playRunning' }).on('click', debugObject.playRunning)
	}
}
