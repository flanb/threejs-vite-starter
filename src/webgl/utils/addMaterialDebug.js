import {
	AdditiveBlending,
	BackSide,
	CustomBlending,
	DoubleSide,
	FrontSide,
	Material,
	MultiplyBlending,
	NoBlending,
	NormalBlending,
	SubtractiveBlending,
	Texture,
} from 'three'
import { FolderApi } from '@tweakpane/core'

const materialParams = {
	wireframe: { type: 'boolean' },
	flatShading: { type: 'boolean' },
	color: { type: 'color', color: { type: 'float' } },
	emissive: { type: 'color', color: { type: 'float' } },
	roughness: { type: 'number', min: 0, max: 1, step: 0.01 },
	metalness: { type: 'number', min: 0, max: 1, step: 0.01 },
	transmission: { type: 'number', min: 0, max: 1, step: 0.01 },
	thickness: { type: 'number', min: 0, max: 1, step: 0.01 },
	clearcoat: { type: 'number', min: 0, max: 1, step: 0.01 },
	clearcoatRoughness: { type: 'number', min: 0, max: 1, step: 0.01 },
	ior: { type: 'number', min: 0, max: 2.333, step: 0.01 },
	reflectivity: { type: 'number', min: 0, max: 1, step: 0.01 },
	opacity: { type: 'number', min: 0, max: 1, step: 0.01 },
	transparent: { type: 'boolean' },
	side: {
		type: 'list',
		options: [
			{ value: FrontSide.toString(), text: 'FrontSide' },
			{ value: BackSide.toString(), text: 'BackSide' },
			{ value: DoubleSide.toString(), text: 'DoubleSide' },
		],
	},
	blending: {
		type: 'list',
		options: [
			{ value: NoBlending.toString(), text: 'NoBlending' },
			{ value: NormalBlending.toString(), text: 'NormalBlending' },
			{ value: AdditiveBlending.toString(), text: 'AdditiveBlending' },
			{
				value: SubtractiveBlending.toString(),
				text: 'SubtractiveBlending',
			},
			{ value: MultiplyBlending.toString(), text: 'MultiplyBlending' },
			{ value: CustomBlending.toString(), text: 'CustomBlending' },
		],
	},
	bumpScale: {
		type: 'number',
		min: 0,
		max: 1,
		step: 0.01,
		condition: 'bumpMap',
	},
	displacementScale: {
		type: 'number',
		min: 0,
		max: 1,
		condition: 'displacementMap',
	},
	displacementBias: {
		type: 'number',
		min: 0,
		max: 1,
		condition: 'displacementMap',
	},

	map: { type: 'image' },
	metalnessMap: { type: 'image' },
	normalMap: { type: 'image' },
	bumpMap: { type: 'image' },
	roughnessMap: { type: 'image' },
	alphaMap: { type: 'image' },
	envMap: { type: 'image' },
	displacementMap: { type: 'image' },
	matcap: { type: 'image' },
	aoMap: { type: 'image' },
	emissiveMap: { type: 'image' },
	lightMap: { type: 'image' },
	aoMapIntensity: { type: 'number', condition: 'aoMap', min: 0, max: 2 },
	envMapIntensity: { type: 'number', condition: 'envMap', min: 0, max: 2 },
	lightMapIntensity: { type: 'number', condition: 'lightMap' },
	emissiveIntensity: {
		type: 'number',
		condition: 'emissiveMap',
		min: 0,
		max: 2,
	},
	uniforms: { type: 'object' },
}

/**
 * Adds debugging functionality to a given 3D material within a folder interface.
 * @param {FolderApi} folder - Tweakpane folder
 * @param {Material} material - 3D material
 * @param {{ title?: string, expanded?: boolean }} [options] - Options
 */
export default function addMaterialDebug(folder, material, options = {}) {
	const materialKeys = Object.keys(materialParams)
	const title = options.title || material?.name || material?.uuid || 'Unknown material'

	const gui = folder.addFolder({
		title,
		expanded: options.expanded || false,
	})

	materialKeys.forEach((key) => {
		const keyValue = material[key]
		const materialOption = materialParams[key]

		if (!(keyValue == null || materialOption.condition)) {
			switch (materialOption.type) {
				case 'image': {
					const bindImage = (image) => {
						gui
							.addBinding({ image }, 'image', {
								view: 'image',
								label: key,
							})
							.on('change', ({ value }) => {
								const previousValue = material[key]
								const texture = new Texture(value)
								texture.colorSpace = previousValue.colorSpace
								texture.flipY = previousValue.flipY
								material[key] = texture
								material[key].needsUpdate = true
							})
					}
					let image = keyValue.image
					if (keyValue.image instanceof ImageBitmap) {
						const canvas = document.createElement('canvas')
						const ctx = canvas.getContext('2d')
						const scaleFactor = 0.1
						canvas.width = keyValue.image.width * scaleFactor
						canvas.height = keyValue.image.height * scaleFactor
						ctx.drawImage(keyValue.image, 0, 0, canvas.width, canvas.height)

						canvas.toBlob((blob) => {
							const bitmapImageElement = new Image()
							bitmapImageElement.src = URL.createObjectURL(blob)
							image = bitmapImageElement
							canvas.remove()

							bindImage(image)
						})
					}

					if (!image.src) return
					bindImage(image)
					break
				}
				case 'list': {
					const options =
						typeof materialOption.options[0] === 'object'
							? materialOption.options
							: materialOption.options.map((v) => ({
									value: v.toString(),
									text: v.toString(),
								}))

					gui
						.addBlade({
							view: 'list',
							label: materialOption.name || key,
							options,
							value: keyValue.toString(),
						})
						.on('change', ({ value }) => {
							material[key] = parseInt(value)
							material.needsUpdate = true
						})
					break
				}
				case 'object': {
					//TODO: refactor
					const uniformsNames = Object.keys(keyValue)
					const uniformsValues = Object.values(keyValue)
					uniformsNames.forEach((uniformName, index) => {
						const uniformValue = uniformsValues[index].value
						if (uniformValue.isTexture) {
							const bindImage = (image) => {
								gui
									.addBinding({ image }, 'image', {
										view: 'image',
										label: uniformName,
									})
									.on('change', ({ value }) => {
										const previousValue = uniformsValues[index].value
										const texture = new Texture(value)
										texture.colorSpace = previousValue.colorSpace
										texture.flipY = previousValue.flipY
										uniformsValues[index].value = texture
										uniformsValues[index].value.needsUpdate = true
									})
							}
							let image = uniformValue.image
							if (uniformValue.image instanceof ImageBitmap) {
								const canvas = document.createElement('canvas')
								const ctx = canvas.getContext('2d')
								const scaleFactor = 0.1
								canvas.width = uniformValue.image.width * scaleFactor
								canvas.height = uniformValue.image.height * scaleFactor
								ctx.drawImage(uniformValue.image, 0, 0, canvas.width, canvas.height)

								canvas.toBlob((blob) => {
									const bitmapImageElement = new Image()
									bitmapImageElement.src = URL.createObjectURL(blob)
									image = bitmapImageElement
									canvas.remove()

									bindImage(image)
								})
							}

							if (!image.src) return
							bindImage(image)
						} else {
							gui.addBinding(keyValue[uniformName], 'value', {
								label: uniformName,
							})
						}
					})

					break
				}
				default: {
					gui
						.addBinding(material, key, {
							...materialOption,
							label: materialOption.name || key,
						})
						.on('change', () => {
							material.needsUpdate = true
						})
					break
				}
			}
		}
	})
	return gui
}
