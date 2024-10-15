import Experience from 'core/Experience.js'
import { CircleGeometry, Mesh, MeshStandardMaterial, RepeatWrapping, SRGBColorSpace } from 'three'
import addObjectDebug from 'utils/addObjectDebug.js'

export default class Floor {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.resources = this.scene.resources
		this.debug = this.experience.debug

		this.setGeometry()
		this.setTextures()
		this.setMaterial()
		this.setMesh()
		if (this.debug.active) this.setDebug()
	}

	setGeometry() {
		this.geometry = new CircleGeometry(5, 64)
	}

	setTextures() {
		this.textures = {}

		this.textures.color = this.resources.items.grassColorTexture
		this.textures.color.colorSpace = SRGBColorSpace
		this.textures.color.repeat.set(1.5, 1.5)
		this.textures.color.wrapS = RepeatWrapping
		this.textures.color.wrapT = RepeatWrapping

		this.textures.normal = this.resources.items.grassNormalTexture
		this.textures.normal.repeat.set(1.5, 1.5)
		this.textures.normal.wrapS = RepeatWrapping
		this.textures.normal.wrapT = RepeatWrapping
	}

	setMaterial() {
		this.material = new MeshStandardMaterial({
			map: this.textures.color,
			normalMap: this.textures.normal,
			name: 'floorMaterial',
		})
	}

	setMesh() {
		this.mesh = new Mesh(this.geometry, this.material)
		this.mesh.rotation.x = -Math.PI * 0.5
		this.mesh.receiveShadow = true
		this.mesh.name = 'floor'
		this.scene.add(this.mesh)
	}

	setDebug() {
		addObjectDebug(this.debug.ui, this.mesh)
	}
}
