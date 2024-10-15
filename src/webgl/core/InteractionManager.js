import { Raycaster, Vector2 } from 'three'
import Experience from 'core/Experience.js'

export default class InteractionManager {
	constructor(camera) {
		this.camera = camera
		this.experience = new Experience()
		this.sizes = this.experience.sizes

		this.raycaster = new Raycaster()
		this.pointer = new Vector2()

		this.#setEvents()

		this.interactiveObjects = []
		this.intersectsObjects = []
		this.needsUpdate = false
	}

	#setEvents() {
		addEventListener('mousemove', (event) => {
			this.pointer.x = (event.clientX / this.sizes.width) * 2 - 1
			this.pointer.y = -(event.clientY / this.sizes.height) * 2 + 1
			this.needsUpdate = true
		})

		addEventListener('click', (event) => {
			if (!this.intersectsObjects.length) return
			this.intersectsObjects.forEach((object) => {
				object.dispatchEvent({ type: 'click' })
			})
		})

		let lastPosition = new Vector2()
		let dragElement
		addEventListener('mousedown', (event) => {
			if (!this.intersectsObjects.length) return
			this.intersectsObjects.forEach((object) => {
				if (object.isHovered) {
					dragElement = object
				}
			})
			lastPosition.copy(this.pointer)
		})

		addEventListener('mouseup', (event) => {
			// if (!this.intersectsObjects.length) return
			const distance = lastPosition.distanceTo(this.pointer)
			if (distance > 0.01) {
				//TODO: WIP
				// dragElement.dispatchEvent({ type: 'drag', distance, direction: this.pointer.clone().sub(lastPosition) })
				// this.intersectsObjects.forEach((object) => {
				// 	object.dispatchEvent({ type: 'drag', distance: lastPosition.distanceTo(this.pointer) })
				// })
			}
			lastPosition.set(0, 0)
		})
	}

	addInteractiveObject(object) {
		if (!this.interactiveObjects.includes(object)) this.interactiveObjects.push(object)
	}

	update() {
		if (!this.needsUpdate) return
		this.intersectsObjects = []
		if (!this.interactiveObjects.length) return
		this.raycaster.setFromCamera(this.pointer, this.camera)

		const intersects = this.raycaster.intersectObjects(this.interactiveObjects)

		intersects.forEach((intersect) => {
			this.interactiveObjects.forEach((object) => {
				if (object.children.includes(intersect.object)) {
					object.dispatchEvent({ type: 'mouseover' })
					this.intersectsObjects.push(object)
					object.isHovered = true
				}
			})
			intersect.object.dispatchEvent({ type: 'mouseover' })
			this.intersectsObjects.push(intersect.object)
			intersect.object.isHovered = true
		})
	}
}
