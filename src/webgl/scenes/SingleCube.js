import Experience from 'core/Experience.js'
import Cube from 'components/Cube/Cube.js'

export default class Main {
	constructor() {
		this.experience = new Experience()
		this.scene = this.experience.scene

		this.cube = new Cube()
	}
}
