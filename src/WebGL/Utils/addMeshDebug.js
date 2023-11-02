import addMaterialDebug from 'utils/addMaterialDebug.js'
import TransformControls from 'utils/TransformControls.js'

//TODO: better mesh debug like material debug
const addMeshDebug = (folder, mesh, options = {}) => {
	if (!folder) {
		console.warn(`[addMeshDebug] No debug folder provided for ${mesh.name}`)
		return
	}
	const title = options.title ? options.title : mesh.name ? mesh.name : mesh.uuid.slice(0, 8)

	const debugFolder = folder.addFolder({
		title,
		expanded: options.expanded || false,
	})

	debugFolder.addBinding(mesh, 'visible', { label: 'visible' })
	debugFolder.addBinding(mesh, 'castShadow', { label: 'cast shadow' })
	debugFolder.addBinding(mesh, 'receiveShadow', { label: 'receive shadow' })

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

	if (mesh.material)
		addMaterialDebug(debugFolder, mesh.material, {
			title: 'Material',
		})
	return debugFolder
}

export default addMeshDebug
