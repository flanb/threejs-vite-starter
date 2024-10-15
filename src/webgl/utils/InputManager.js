import EventEmitter from 'core/EventEmitter.js'

class InputManager extends EventEmitter {
	constructor() {
		super()

		this.setKeyEvents()
		this.setMouseEvents()
	}

	setKeyEvents() {
		addEventListener('keydown', ({ key }) => {
			this.trigger(key, [true])
			this.setKeyHandler(key, true)
		})
		addEventListener('keyup', ({ key }) => {
			this.trigger(key, [false])
			this.setKeyHandler(key, false)
		})
	}

	setKeyHandler(key, value) {
		switch (key.toLowerCase()) {
			case 'arrowup':
			case 'w':
			case 'z':
				this.trigger('up', [value])
				break
			case 'arrowdown':
			case 's':
				this.trigger('down', [value])
				break
			case 'arrowleft':
			case 'q':
			case 'a':
				this.trigger('left', [value])
				break
			case 'arrowright':
			case 'd':
				this.trigger('right', [value])
				break
			case ' ':
				this.trigger('space', [value])
				break
			case 'shift':
				this.trigger('shift', [value])
				break
			default:
				break
		}
	}

	setMouseEvents() {
		addEventListener('mousedown', (event) => {
			this.trigger('mousedown', [event])

			this.triggerOnce('audioContextReady', [event])
		})
		addEventListener('mouseup', ({ event }) => {
			this.trigger('mouseup', [event])
		})
	}
}

export default new InputManager()
