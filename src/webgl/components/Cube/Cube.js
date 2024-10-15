import Experience from 'core/Experience.js'
import fragmentShader from './fragmentShader.frag'
import vertexShader from './vertexShader.vert'
import { BoxGeometry, Mesh, ShaderMaterial, Vector3 } from 'three'
import addObjectDebug from 'utils/addObjectDebug.js'
import InteractionManager from 'core/InteractionManager.js'

export default class Cube {
	constructor(_position = new Vector3(0, 0, 0)) {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.debug = this.experience.debug

		this.position = _position

		this.setGeometry()
		this.setMaterial()
		this.setMesh()

		this.setInteraction()
	}

	setGeometry() {
		this.geometry = new BoxGeometry(1, 1, 1)
	}

	setMaterial() {
		this.material = new ShaderMaterial({
			fragmentShader,
			vertexShader,
			uniforms: {
				uOpacity: { value: 1 },
			},
		})
	}

	setMesh() {
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.position.copy(this.position)
		this.mesh.name = 'cube'
		this.scene.add(this.mesh)

		if (this.debug.active) addObjectDebug(this.experience.debug.ui, this.mesh)
	}

	setInteraction() {
		this.experience.interactionManager.addInteractiveObject(this.mesh)
		this.mesh.addEventListener('click', () => {
			console.log('cube click')
		})
	}
}
