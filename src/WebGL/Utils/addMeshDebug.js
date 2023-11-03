import addMaterialDebug from 'utils/addMaterialDebug.js'
import TransformControls from 'utils/TransformControls.js'
import { FolderApi } from '@tweakpane/core'
import { Mesh } from 'three'

const meshParams = {
	visible: { type: 'boolean' },
	castShadow: { type: 'boolean' },
	receiveShadow: { type: 'boolean' },
}

/**
 * Adds debugging functionality to a given 3D mesh within a folder interface.
 * @param {FolderApi} folder
 * @param {Mesh} mesh
 * @param {{ title?: string, expanded?: boolean }} options
 * @returns {FolderApi}
 */
export default function addMeshDebug(folder, mesh, options = {}) {
	const title = options.title ? options.title : mesh.name ? mesh.name : mesh.uuid.slice(0, 8)

	const debugFolder = folder.addFolder({
		title,
		expanded: options.expanded || false,
	})

	const meshKeys = Object.keys(meshParams)

	meshKeys.forEach((key) => {
		const keyValue = mesh[key]
		const meshOption = meshParams[key]
		if (keyValue !== undefined) {
			debugFolder.addBinding(mesh, key, {
				...meshOption,
				label: key,
			})
		}
	})

	/**
	 * Transform controls
	 */

	const controls = new TransformControls()
	debugFolder
		.addBinding({ control: false }, 'control', {
			label: 'transform control',
		})
		.on('change', ({ value }) => {
			if (value) {
				controls.instance.attach(mesh)
			} else {
				controls.instance.detach()
			}
			transformModeBlade.hidden = !value
		})

	const transformModeBlade = debugFolder.addBinding(controls.instance, 'mode', {
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

	const positionBinding = debugFolder.addBinding(mesh, 'position', {
		label: 'position',
	})

	const rotationBinding = debugFolder.addBinding(mesh, 'rotation', {
		label: 'rotation',
	})

	const scaleBinding = debugFolder.addBinding(mesh, 'scale', {
		label: 'scale',
	})

	controls.on('change', () => {
		positionBinding.refresh()
		rotationBinding.refresh()
		scaleBinding.refresh()
	})

	mesh.traverse((child) => {
		if (child.material) {
			addMaterialDebug(debugFolder, child.material, {
				title: child.material.name || `${child.name}Material(${child.material.uuid.slice(0, 8)})`,
			})
		}
	})

	//TODO: if there is animations, add animation debug

	return debugFolder
}
