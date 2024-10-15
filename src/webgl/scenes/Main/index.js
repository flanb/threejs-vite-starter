import Experience from 'core/Experience.js'
import Environment from 'components/Environment.js'
import Floor from 'components/Floor.js'
import Fox from 'components/Fox/Fox.js'
import Cube from 'components/Cube/Cube.js'
import Resources from 'core/Resources.js'
import sources from './sources.json'
import AudioManager from 'utils/AudioManager.js'

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
		})

		const audioManager = new AudioManager()
	}

	update() {
		if (this.fox) this.fox.update()
	}
}
