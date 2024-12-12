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
		this.model = this.resources.items.clothModel.clone()
		this.model.position.y = 2

		this.scene.add(this.model)
	}

	#createMaterial() {
		const vatTexture = this.resources.items.clothPositionTexture

		this.material = new ShaderMaterial({
			side: 2,
			uniforms: {
				uTime: { value: 0 },
				posTexture: { value: vatTexture },
				totalFrames: { value: 99 },
				fps: { value: 30 },
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

				switch (value.name.split('.').pop()) {
					case 'glb':
					case 'gltf':
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
						break
					case 'fbx':
						const { fbxLoader } = this.scene.resources.loaders
						fbxLoader.load(url, (fbx) => {
							this.scene.remove(this.model)
							this.model = fbx
							this.scene.add(this.model)
							this.model.position.y = 2

							this.model.traverse((child) => {
								if (child.isMesh) {
									child.material = this.material
								}
							})
						})
						break
				}
			})
	}

	update() {
		if (this.material) this.material.uniforms.uTime.value = this.experience.time.elapsed / 1000
	}
}
