import Experience from 'core/Experience.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { FolderApi } from '@tweakpane/core'
import { Object3D } from 'three'

/**
 * @param {Object3D} object - Object to attach transform controls to
 * @param {FolderApi} [debugFolder] - Tweakpane folder
 * @returns {TransformControls} - Transform controls instance
 */
export default class useTransformControls {
	constructor(object, debugFolder, name) {
		if (!object) throw new Error('useTransformControls: object is undefined')

		this.experience = new Experience()
		this.camera = this.experience.camera
		this.canvas = this.experience.canvas
		this.scene = this.experience.scene
		this.debug = this.experience.debug

		this.options = {
			object,
			debugFolder,
			name,
		}

		this.setInstance()
		if (debugFolder) this.setDebugFeature()
		return this.instance
	}

	setInstance() {
		this.instance = new TransformControls(this.camera.instance, this.canvas)

		let controlsIsEnable
		this.instance.addEventListener('dragging-changed', ({ value }) => {
			if (!this.instance.camera.controls) return
			if (value) {
				controlsIsEnable = this.instance.camera.controls.enabled
				this.instance.camera.controls.enabled = !value
			} else {
				if (controlsIsEnable) {
					this.instance.camera.controls.enabled = !value
				}
			}
		})

		this.instance.name = 'transformControl'
		this.instance.getHelper().devObject = true
		this.scene.add(this.instance.getHelper())

		if (this.options.object.parent === null) {
			this.options.object.devObject = true
			this.scene.add(this.options.object)
		}
		this.instance.attach(this.options.object)
		if (this.options.debugFolder) this.instance.enabled = this.instance.getHelper().visible = false
	}

	setDebugFeature() {
		this.options.debugFolder
			.addBinding({ control: false }, 'control', {
				label: this.options.name || 'transform control',
			})
			.on('change', ({ value }) => {
				this.instance.camera = this.camera.instance
				this.instance.enabled = this.instance.getHelper().visible = value
				transformModeBlade.hidden = !value
			})

		const transformModeBlade = this.options.debugFolder.addBinding(this.instance, 'mode', {
			view: 'radiogrid',
			size: [3, 1],
			groupName: 'transformMode',
			cells: (x) => {
				const cells = ['Translate', 'Rotate', 'Scale']
				return {
					title: cells[x],
					value: cells[x].toLowerCase(),
				}
			},
		})
		transformModeBlade.hidden = true
		transformModeBlade.element.firstChild.remove()
		transformModeBlade.element.firstChild.style.width = '100%'

		/**
		 * Position, rotation, scale
		 */

		const positionBinding = this.options.debugFolder.addBinding(this.options.object, 'position', {
			label: 'position',
		})

		const rotationBinding = this.options.debugFolder.addBinding(this.options.object, 'rotation', {
			label: 'rotation',
		})

		const scaleBinding = this.options.debugFolder.addBinding(this.options.object, 'scale', {
			label: 'scale',
		})

		this.instance.addEventListener('change', () => {
			positionBinding.refresh()
			rotationBinding.refresh()
			scaleBinding.refresh()
			this.options.object.helper?.update()
		})
	}
}
