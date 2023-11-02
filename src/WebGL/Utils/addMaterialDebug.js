import {
	AdditiveBlending,
	BackSide,
	ClampToEdgeWrapping,
	CustomBlending,
	DoubleSide,
	EquirectangularReflectionMapping,
	FrontSide,
	MultiplyBlending,
	NoBlending,
	NormalBlending,
	SubtractiveBlending,
	Texture,
	UVMapping,
	Vector2,
	Material,
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
}

/**
 * Adds debugging functionality to a given 3D material within a folder interface.
 * @param {FolderApi} folder
 * @param {Material} material
 * @param {{ title?: string, expanded?: boolean }} options
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
					//FIXME: update image tweakpane plugin
					const param = material[key]
					const image = param.image
					if (!image.src) return
					const localState = { url: image.src }
					let repeat

					if (param.repeat) {
						repeat = new Vector2().copy(param.repeat)
					}

					gui
						.addBinding(localState, 'url', {
							view: 'input-image',
							imageFit: 'cover',
							label: key,
							extensions: ['jpg', 'png', 'gif', 'webp'],
						})
						.on('change', ({ value }) => {
							const imageElement = new Image()
							imageElement.src = value.src
							imageElement.addEventListener('load', () => {
								const texture = new Texture(imageElement, UVMapping, ClampToEdgeWrapping, ClampToEdgeWrapping)
								if (repeat) {
									texture.repeat.copy(repeat)
								}

								if (key === 'envMap') {
									texture.mapping = EquirectangularReflectionMapping
								}

								texture.needsUpdate = true
								material[key] = texture
								material.needsUpdate = true
							})
						})
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
}
