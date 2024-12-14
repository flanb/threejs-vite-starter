import { BoxGeometry, Mesh, ShaderMaterial, Vector3, NearestFilter, RGBAFormat } from 'three'
import Experience from 'core/Experience.js'
import vertexShader from './vertexShader.vert'
import fragmentShader from './fragmentShader.frag'
import addObjectDebug from '@/webgl/utils/addObjectDebug'

export default class VAT {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.scene.resources

		this.#createModel()
		this.#createMaterial()
		if (this.experience.debug.active) this.#createDebug()
	}

	#createModel() {
		this.model = this.resources.items.clothModel.scene.clone()
		console.log(this.model)

		this.model.position.y = 2

		this.scene.add(this.model)
	}

	#createMaterial() {
		const vatTexture = this.resources.items.clothPositionTexture
		const normalTexture = this.resources.items.clothNormalTexture
		// vatTexture.minFilter = NearestFilter
		// vatTexture.magFilter = NearestFilter
		// vatTexture.format = RGBAFormat

		this.material = new ShaderMaterial({
			side: 2,
			uniforms: {
				uTime: { value: 0 },
				posTexture: { value: vatTexture },
				normalTexture: { value: normalTexture },
				totalFrames: { value: 50 },
				fps: { value: 24 },
			},
			vertexShader,
			fragmentShader,
		})
		this.model.traverse((child) => {
			if (child.isMesh) {
				child.material = this.material
			}
		})
	}

	#createDebug() {
		const debugFolder = addObjectDebug(this.experience.debug.ui, this.model, {
			expanded: true,
		})
		// new model import
		debugFolder
			.addBinding({ file: '' }, 'file', {
				view: 'file-input',
				label: 'new model',
			})
			.on('change', ({ value }) => {
				const blob = new Blob([value])
				const url = URL.createObjectURL(blob)

				const { gltfLoader } = this.scene.resources.loaders

				gltfLoader.load(url, (gltf) => {
					this.scene.remove(this.model)
					this.model = gltf.scene
					this.scene.add(this.model)
					this.model.position.y = 2

					this.model.traverse((child) => {
						if (child.isMesh) {
							child.material = this.material
						}
					})
				})
			})
		debugFolder
			.addBinding({ file: '' }, 'file', {
				view: 'file-input',
				label: 'new position texture (exr)',
			})
			.on('change', ({ value }) => {
				const blob = new Blob([value])
				const url = URL.createObjectURL(blob)

				const { exrLoader } = this.scene.resources.loaders

				exrLoader.load(url, (texture) => {
					this.material.uniforms.posTexture.value = texture
				})
			})
		debugFolder
			.addBinding({ file: '' }, 'file', {
				view: 'file-input',
				label: 'new normal texture (png)',
			})
			.on('change', ({ value }) => {
				const blob = new Blob([value])
				const url = URL.createObjectURL(blob)

				const { textureLoader } = this.scene.resources.loaders

				textureLoader.load(url, (texture) => {
					this.material.uniforms.normalTexture.value = texture
				})
			})
	}

	update() {
		if (this.material) this.material.uniforms.uTime.value = this.experience.time.elapsed * 0.001
	}
}
