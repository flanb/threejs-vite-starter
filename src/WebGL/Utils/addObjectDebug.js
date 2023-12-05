import addMaterialDebug from 'utils/addMaterialDebug.js'
import useTransformControls from 'utils/useTransformControls.js'
import { FolderApi } from '@tweakpane/core'
import { Object3D } from 'three'

const objectParams = {
	visible: { type: 'boolean' },
	castShadow: { type: 'boolean' },
	receiveShadow: { type: 'boolean' },
}

/**
 * Adds debugging functionality to a given 3D object within a folder interface.
 * @param {FolderApi} folder - Tweakpane folder
 * @param {Object3D} object - 3D mesh
 * @param {{ title?: string, expanded?: boolean }} options - Options
 * @returns {FolderApi} - Tweakpane folder
 */
export default function addObjectDebug(folder, object, options = {}) {
	const title = options.title ? options.title : object.name ? object.name : object.uuid.slice(0, 8)

	const debugFolder = folder.addFolder({
		title,
		expanded: options.expanded || false,
	})

	const meshKeys = Object.keys(objectParams)

	meshKeys.forEach((key) => {
		const keyValue = object[key]
		const meshOption = objectParams[key]
		if (keyValue !== undefined) {
			debugFolder.addBinding(object, key, {
				...meshOption,
				label: key,
			})
		}
	})

	const controls = new useTransformControls(object, debugFolder)

	object.traverse((child) => {
		if (child.material) {
			addMaterialDebug(debugFolder, child.material, {
				title: child.material.name || `${child.name}Material(${child.material.uuid.slice(0, 8)})`,
			})
		}
	})

	//TODO: if there is animations, add animation debug

	return debugFolder
}
