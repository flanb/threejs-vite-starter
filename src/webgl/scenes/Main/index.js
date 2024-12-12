import Experience from 'core/Experience.js'
import Environment from 'components/Environment.js'
import Floor from 'components/Floor.js'
import Fox from 'components/Fox/Fox.js'
import Cube from 'components/Cube/Cube.js'
import VAT from 'components/VAT'
import Resources from 'core/Resources.js'
import sources from './sources.json'

export default class Main {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene
		this.scene.resources = new Resources(sources)

		// Wait for resources
		this.scene.resources.on('ready', () => {
			// Setup
			this.floor = new Floor()
			this.fox = new Fox()
			this.cube = new Cube()
			this.environment = new Environment()
			this.vat = new VAT()
		})
	}

	update() {
		if (this.fox) this.fox.update()
		if (this.vat) this.vat.update()
	}
}
