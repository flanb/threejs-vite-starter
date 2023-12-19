import Experience from './Experience.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { CameraHelper, PerspectiveCamera, Vector3 } from 'three'

function setCameraDebugPositionAndTarget(camera) {
	const debugCameraPosition = JSON.parse(sessionStorage.getItem('debugCameraPosition'))
	const debugCameraTarget = JSON.parse(sessionStorage.getItem('debugCameraTarget'))

	if (debugCameraPosition) {
		camera.position.copy(new Vector3(debugCameraPosition.x, debugCameraPosition.y, debugCameraPosition.z))
	} else {
		camera.position.copy(this.options.position)
	}

	if (debugCameraTarget) {
		camera.lookAt(new Vector3(debugCameraTarget.x, debugCameraTarget.y, debugCameraTarget.z))
	} else {
		camera.lookAt(this.options.target)
	}
}
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
			currentCamera: 'sceneCamera',
		}

		this.setInstance()
		if (this.options.currentCamera === 'controlsCamera') this.setControlsCamera()
		if (this.options.currentCamera === 'fpsCamera') this.setFpsCamera()

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
		this.sceneCamera.name = 'sceneCamera'

		this.instance = this.sceneCamera
	}

	setControlsCamera() {
		this.controlsCamera = new PerspectiveCamera(50, this.sizes.width / this.sizes.height)
		this.controlsCamera.name = 'controlsCamera'
		this.controlsCamera.controls = new OrbitControls(this.controlsCamera, this.canvas)

		//Apply saved settings
		this.controlsCamera.controls.addEventListener('change', () => {
			sessionStorage.setItem('debugCameraPosition', JSON.stringify(this.controlsCamera.position))
			sessionStorage.setItem('debugCameraTarget', JSON.stringify(this.controlsCamera.controls.target))
		})

		setCameraDebugPositionAndTarget.bind(this)(this.controlsCamera)

		//Helper
		if (!this.sceneCamera.cameraHelper) {
			this.sceneCamera.cameraHelper = new CameraHelper(this.sceneCamera)
			this.sceneCamera.cameraHelper.name = 'cameraHelper'
			this.scene.add(this.sceneCamera.cameraHelper)
		}

		this.instance = this.controlsCamera
	}

	setFpsCamera() {
		this.fpsCamera = new PerspectiveCamera(50, this.sizes.width / this.sizes.height)
		this.fpsCamera.name = 'fpsCamera'

		setCameraDebugPositionAndTarget.bind(this)(this.fpsCamera)

		//Helper
		if (!this.sceneCamera.cameraHelper) {
			this.sceneCamera.cameraHelper = new CameraHelper(this.sceneCamera)
			this.sceneCamera.cameraHelper.name = 'cameraHelper'
			this.scene.add(this.sceneCamera.cameraHelper)
		}

		this.instance = this.fpsCamera
	}

	resetDebugPosition() {
		sessionStorage.removeItem('debugCameraPosition')
		sessionStorage.removeItem('debugCameraTarget')

		if (this.instance.name === 'sceneCamera') return
		this.instance.position.copy(this.options.position)
		this.instance.lookAt(this.options.target)
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
			.addBlade({
				view: 'list',
				label: 'currentCamera',
				options: [
					{ text: 'SceneCamera', value: 'sceneCamera' },
					{ text: 'ControlsCamera', value: 'controlsCamera' },
					{ text: 'FpsCamera', value: 'fpsCamera' },
				],
				value: this.instance.name,
			})
			.on('change', ({ value }) => {
				const isSceneCamera = value === 'sceneCamera'

				if (!isSceneCamera) {
					this[`set${value.charAt(0).toUpperCase() + value.slice(1)}`]()
					setCameraDebugPositionAndTarget.bind(this)(this[value])
				}

				this.sceneCamera.cameraHelper.visible = !isSceneCamera
				if (this.controlsCamera) this.controlsCamera.controls.enabled = value === 'controlsCamera'
				this.instance = this[value]
			})

		debugFolder
			.addButton({
				title: 'Reset debug position',
			})
			.on('click', this.resetDebugPosition.bind(this))
	}
}
