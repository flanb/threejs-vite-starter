import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CameraHelper, PerspectiveCamera, Vector3 } from 'three'
import useTransformControls from 'utils/useTransformControls.js'

export default class Camera {
	constructor() {
		this.experience = new Experience()
		this.sizes = this.experience.sizes
		this.scene = this.experience.scene
		this.canvas = this.experience.canvas
		this.debug = this.experience.debug

		this.options = {
			fov: 35,
			frustum: { min: 1, max: 100 },
			position: new Vector3(6, 4, 8),
			target: new Vector3(0, 0, 0),
			controlsCamera: { active: false, position: new Vector3(6, 4, 8), target: new Vector3(0, 0, 0) },
		}

		this.setInstance()
		if (this.options.controlsCamera.active) this.setControlsCamera()
		if (this.debug.active) this.setDebug()
	}

	setInstance() {
		this.sceneCamera = new PerspectiveCamera(
			this.options.fov,
			this.sizes.width / this.sizes.height,
			this.options.frustum.min,
			this.options.frustum.max,
		)
		this.sceneCamera.position.copy(this.options.position)
		this.sceneCamera.lookAt(this.options.target)
		this.sceneCamera.updateMatrixWorld()
		this.sceneCamera.name = 'camera'

		this.instance = this.sceneCamera
	}

	setControlsCamera() {
		this.controlsCamera = new PerspectiveCamera(50, this.sizes.width / this.sizes.height)
		this.controlsCamera.name = 'controlsCamera'
		this.controlsCamera.controls = new OrbitControls(this.controlsCamera, this.canvas)

		//Apply saved settings
		this.controlsCamera.controls.addEventListener('change', () => {
			sessionStorage.setItem('controlsCameraPosition', JSON.stringify(this.controlsCamera.position))
			sessionStorage.setItem('controlsCameraTarget', JSON.stringify(this.controlsCamera.controls.target))
		})

		const controlsCameraPosition = JSON.parse(sessionStorage.getItem('controlsCameraPosition'))
		const controlsCameraTarget = JSON.parse(sessionStorage.getItem('controlsCameraTarget'))
		if (controlsCameraPosition) {
			this.controlsCamera.position.copy(
				new Vector3(controlsCameraPosition.x, controlsCameraPosition.y, controlsCameraPosition.z),
			)
		} else {
			this.controlsCamera.position.copy(this.options.controlsCamera.position)
		}
		if (controlsCameraTarget) {
			this.controlsCamera.lookAt(new Vector3(controlsCameraTarget.x, controlsCameraTarget.y, controlsCameraTarget.z))
		} else {
			this.controlsCamera.lookAt(this.options.controlsCamera.target)
		}

		//Helper
		this.instance.cameraHelper = new CameraHelper(this.instance)
		this.instance.cameraHelper.name = 'cameraHelper'
		this.scene.add(this.instance.cameraHelper)

		this.instance = this.controlsCamera
	}

	resetControls() {
		sessionStorage.removeItem('controlsCameraPosition')
		sessionStorage.removeItem('controlsCameraTarget')

		this.controlsCamera.controls.reset()
		this.controlsCamera.position.copy(this.options.controlsCamera.position)
		this.controlsCamera.lookAt(this.options.controlsCamera.target)
	}

	resize() {
		this.instance.aspect = this.sizes.width / this.sizes.height
		this.instance.updateProjectionMatrix()
	}

	setDebug() {
		const debugFolder = this.debug.ui.addFolder({
			title: 'Camera',
			expanded: false,
		})

		debugFolder.addBinding(this.options, 'fov', { min: 0, max: 180, step: 1 }).on('change', () => {
			this.sceneCamera.fov = this.options.fov
			this.sceneCamera.updateProjectionMatrix()
			if (this.sceneCamera.cameraHelper) this.sceneCamera.cameraHelper.update()
		})

		debugFolder.addBinding(this.options, 'frustum', { min: 0.1, max: 100, step: 0.1 }).on('change', () => {
			this.sceneCamera.near = this.options.frustum.min
			this.sceneCamera.far = this.options.frustum.max
			this.sceneCamera.updateProjectionMatrix()
			if (this.sceneCamera.cameraHelper) this.sceneCamera.cameraHelper.update()
		})

		debugFolder
			.addBinding(this.options.controlsCamera, 'active', {
				label: 'Controls camera',
			})
			.on('change', ({ value }) => {
				if (value) {
					if (this.controlsCamera) {
						this.instance.cameraHelper.visible = true
					} else {
						this.setControlsCamera()
					}
					this.instance = this.controlsCamera
				} else {
					this.instance = this.sceneCamera
					this.instance.cameraHelper.visible = false
				}
			})

		debugFolder
			.addButton({
				title: 'Reset Controls',
			})
			.on('click', this.resetControls.bind(this))
	}
}
