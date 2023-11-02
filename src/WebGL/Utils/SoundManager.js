import EventEmitter from 'utils/EventEmitter.js'

//if you want more options, you can use howler.js https://github.com/goldfire/howler.js
class SoundManager extends EventEmitter {
	constructor() {
		super()

		this.sounds = {
			earthquake: new Audio('/sounds/test.mp3'),
		}

		this.sounds.test.loop = true
	}

	play(name) {
		return new Promise((resolve) => {
			this.sounds[name].play()
			this.sounds[name].addEventListener('ended', resolve)
		})
	}

	playAll() {
		for (let name in this.sounds) {
			this.sounds[name].play()
		}
	}

	pause(name) {
		this.sounds[name].pause()
	}

	pauseAll() {
		for (let name in this.sounds) {
			this.sounds[name].pause()
		}
	}

	stop(name) {
		this.sounds[name].pause()
		this.sounds[name].currentTime = 0
	}

	stopAll() {
		for (let name in this.sounds) {
			this.sounds[name].pause()
			this.sounds[name].currentTime = 0
		}
	}

	muteAll() {
		for (let name in this.sounds) {
			this.sounds[name].muted = true
		}
		this._allMuted = true
	}

	unmuteAll() {
		for (let name in this.sounds) {
			this.sounds[name].muted = false
		}
		this._allMuted = false
	}

	toggleMuteAll() {
		if (this._allMuted) {
			this.unmuteAll()
		} else {
			this.muteAll()
		}
	}
}

export default new SoundManager()
