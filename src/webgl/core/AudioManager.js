import Experience from 'core/Experience.js'
import { AudioListener, Mesh, PositionalAudio, Vector3, Audio } from 'three'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import { PositionalAudioHelper } from 'three/examples/jsm/helpers/PositionalAudioHelper.js'
import InputManager from 'utils/InputManager.js'

export default class AudioManager {
	constructor() {
		//TODO: make it independant
		this.experience = new Experience()
		this.camera = this.experience.camera
		this.scene = this.experience.scene
		this.resources = this.scene.resources
		this.debug = this.experience.debug

		this.audioContextReady = false

		this.setCameraListener()
		this.resources.on('ready', () => {
			//TODO: move this json somewhere else
			/**
			 * @type {{[key]: {volume: number, loop: boolean, refDistance?: number, buffer: AudioBuffer, position?: Vector3, autoplay: boolean}}}
			 */
			this.audios = {
				foxPositional: {
					buffer: this.resources.items.foxAudio,
					refDistance: 20,
					loop: false,
					volume: 1,
					position: new Vector3(0, 0, 0),
					autoplay: false,
				},
				fox: {
					buffer: this.resources.items.foxAudio,
					loop: false,
					volume: 1,
					autoplay: false,
				},
			}
			this.setAudios()
			if (this.debug.active) this.setDebug()
		})

		InputManager.on('audioContextReady', () => {
			this.audioContextReady = true

			Object.keys(this.audios).forEach((key) => {
				const audio = this.audios[key]
				if (audio.autoplay) audio.instance.play()
			})
		})
	}

	setCameraListener() {
		this.audioListener = new AudioListener()
		this.camera.sceneCamera.add(this.audioListener)
	}

	setAudios() {
		Object.keys(this.audios).forEach((key) => {
			if (this.audios[key].position) {
				const audio = this.audios[key]
				audio.instance = new PositionalAudio(this.audioListener)
				audio.instance.setBuffer(audio.buffer)
				audio.instance.setRefDistance(audio.refDistance || 20)
				audio.instance.setLoop(audio.loop || false)
				audio.instance.setVolume(audio.volume || 1)
				audio.mesh = new Mesh()
				audio.mesh.add(audio.instance)
				audio.mesh.position.copy(audio.position)
				audio.mesh.name = key
				this.scene.add(audio.mesh)
			} else {
				const audio = this.audios[key]
				audio.instance = new Audio(this.audioListener)
				audio.instance.setBuffer(audio.buffer)
				audio.instance.setLoop(audio.loop || false)
				audio.instance.setVolume(audio.volume || 1)
				audio.instance.name = key
			}
		})
	}

	setDebug() {
		this.debugFolder = this.debug.ui.addFolder({ title: 'Audio Manager', expanded: false })
		this.debugFolder
			.addBlade({
				view: 'buttongrid',
				size: [2, 1],
				cells: (x, y) => ({
					title: [['Play all', 'Stop all']][y][x],
				}),
			})
			.on('click', (event) => {
				Object.keys(this.audios).forEach((key) => {
					const audio = this.audios[key]
					if (event.index[0] === 0) {
						audio.instance.play()
					} else {
						audio.instance.stop()
					}
				})
			})

		this.debugFolder
			.addBinding({ control: false }, 'control', {
				label: 'transform control',
			})
			.on('change', ({ value }) => {
				Object.keys(this.audios).forEach((key) => {
					const audio = this.audios[key]
					if (!audio.position) return
					if (value) {
						audio.helper = new PositionalAudioHelper(audio.instance, audio.refDistance)
						audio.instance.add(audio.helper)
						audio.transform = new TransformControls(this.camera.instance, this.experience.canvas)
						audio.transform.addEventListener('change', () => {
							audio.position.copy(audio.mesh.position)
							this.debug.ui.refresh()
						})
						let controlsIsEnable
						audio.transform.addEventListener('dragging-changed', ({ value }) => {
							if (!this.camera.instance.controls) return
							if (value) {
								controlsIsEnable = this.camera.instance.controls.enabled
								this.camera.instance.controls.enabled = !value
							} else {
								if (controlsIsEnable) {
									this.camera.instance.controls.enabled = !value
								}
							}
						})
						audio.transform.attach(audio.mesh)
						audio.transform.getHelper().devObject = true
						this.scene.add(audio.transform.getHelper())
					} else {
						audio.helper.dispose()
						audio.instance.remove(audio.helper)
						delete audio.helper
						//TODO: Temporary fix for three function
						// audio.transform.dispose()
						audio.transform.disconnect()
						audio.transform.getHelper().traverse(function (child) {
							if (child.geometry) child.geometry.dispose()
							if (child.material) child.material.dispose()
						})
						this.scene.remove(audio.transform.getHelper())
						delete audio.transform
					}
				})
			})

		Object.keys(this.audios).forEach((key) => {
			const audio = this.audios[key]
			const audioFolder = this.debugFolder.addFolder({ title: key, expanded: false })
			audioFolder
				.addBlade({
					view: 'buttongrid',
					size: [2, 1],
					cells: (x, y) => ({
						title: [['Play', 'Stop']][y][x],
					}),
				})
				.on('click', (event) => {
					if (event.index[0] === 0) {
						audio.instance.play()
					} else {
						audio.instance.stop()
					}
				})
			audioFolder.addBinding(audio, 'volume', { label: 'Volume', min: 0, max: 1, step: 0.01 }).on('change', () => {
				audio.instance.setVolume(audio.volume)
			})
			if (audio.refDistance) {
				audioFolder
					.addBinding(audio, 'refDistance', { label: 'Ref Distance', min: 0, max: 100, step: 1 })
					.on('change', () => {
						audio.instance.setRefDistance(audio.refDistance)
						if (audio.helper) {
							audio.helper.range = audio.refDistance
							audio.helper.update()
						}
					})
			}
			audioFolder.addBinding(audio, 'loop', { label: 'Loop' }).on('change', () => {
				audio.instance.setLoop(audio.loop)
			})
			if (audio.position) {
				audioFolder.addBinding(audio, 'position', { label: 'Position' }).on('change', () => {
					audio.mesh.position.copy(audio.position)
				})
			}
		})
	}
}
