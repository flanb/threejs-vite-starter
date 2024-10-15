import EventEmitter from 'core/EventEmitter.js'
import { AudioLoader, CubeTexture, CubeTextureLoader, Object3D, Texture, TextureLoader } from 'three'
import Experience from 'core/Experience.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Resources extends EventEmitter {
	constructor(sources) {
		super()

		this.experience = new Experience()
		this.debug = this.experience.debug

		this.sources = sources

		/**
		 * @type {{[name: string]: Texture | CubeTexture | Object3D | AudioBuffer}}
		 */
		this.items = {}
		this.toLoad = this.sources.length
		this.loaded = 0

		if (this.toLoad === 0) {
			console.warn('No resources to load.')
			this.trigger('ready')
			return
		}

		if (!this.debug.active || this.debug.debugParams.LoadingScreen) {
			this.setLoadingScreen()
		}
		this.setLoaders()
		this.startLoading()
	}

	setLoadingScreen() {
		const loadingScreenStyles = {
			position: 'fixed',
			top: 0,
			left: 0,
			width: '100%',
			height: '100%',
			background: '#000',
			zIndex: 100,
		}
		const loadingBarStyles = {
			position: 'fixed',
			top: '50%',
			left: '25%',
			width: '50%',
			margin: 'auto',
			height: '2px',
			background: 'white',
			zIndex: 100,
			transformOrigin: 'left',
			transform: 'scaleX(0)',
		}
		this.loadingScreenElement = document.createElement('div')
		Object.assign(this.loadingScreenElement.style, loadingScreenStyles)
		this.loadingBarElement = document.createElement('div')
		Object.assign(this.loadingBarElement.style, loadingBarStyles)
		this.loadingScreenElement.appendChild(this.loadingBarElement)
		document.body.appendChild(this.loadingScreenElement)
	}

	setLoaders() {
		this.loaders = {}
		this.loaders.gltfLoader = new GLTFLoader()
		const dracoLoader = new DRACOLoader()
		dracoLoader.setDecoderPath('/draco/')
		this.loaders.gltfLoader.setDRACOLoader(dracoLoader)
		this.loaders.textureLoader = new TextureLoader()
		this.loaders.cubeTextureLoader = new CubeTextureLoader()
		this.loaders.audioLoader = new AudioLoader()
	}

	startLoading() {
		if (this.debug.active && this.debug.debugParams.ResourceLog) {
			console.group('🖼️ Resources')
			console.debug('⏳ Loading resources...')
			this.totalStartTime = performance.now()
		}
		// Load each source
		for (const source of this.sources) {
			source.startTime = performance.now()
			switch (source.type) {
				case 'gltf':
					this.loaders.gltfLoader.load(source.path, (file) => {
						this.sourceLoaded(source, file)
					})
					break
				case 'texture':
					this.loaders.textureLoader.load(source.path, (file) => {
						this.sourceLoaded(source, file)
					})
					break
				case 'cubeTexture':
					this.loaders.cubeTextureLoader.load(source.path, (file) => {
						this.sourceLoaded(source, file)
					})
					break
				case 'audio':
					this.loaders.audioLoader.load(source.path, (file) => {
						this.sourceLoaded(source, file)
					})
					break
				default:
					console.error(source.type + ' is not a valid source type')
					break
			}
		}
	}

	sourceLoaded(source, file) {
		const { name, path, type, startTime, ...rest } = source
		Object.assign(file, rest)
		this.items[source.name] = file
		this.loaded++
		source.endTime = performance.now()
		source.loadTime = Math.floor(source.endTime - source.startTime)

		if (this.debug.active && this.debug.debugParams.ResourceLog)
			console.debug(
				`%c🖼️ ${source.name}%c loaded in ${source.loadTime}ms. (${this.loaded}/${this.toLoad})`,
				'font-weight: bold',
				'font-weight: normal',
			)
		if (this.loadingScreenElement) {
			this.loadingBarElement.style.transform = `scaleX(${this.loaded / this.toLoad})`
		}

		if (this.loaded === this.toLoad) {
			if (this.debug.active && this.debug.debugParams.ResourceLog) {
				const totalEndTime = performance.now()
				const totalLoadTime = totalEndTime - this.totalStartTime
				console.debug(`✅ Resources loaded in ${totalLoadTime}ms!`)
				console.groupEnd()
			}
			if (this.loadingScreenElement) this.loadingScreenElement.remove()
			this.trigger('ready')
		}
	}
}
