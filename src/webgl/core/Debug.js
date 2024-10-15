import { Pane } from 'tweakpane'
import * as TweakpaneEssentialsPlugin from '@tweakpane/plugin-essentials'
import * as TweakpanePluginMedia from 'tweakpane-plugin-media'
import Stats from 'stats.js'
import Experience from 'core/Experience.js'

export default class Debug {
	constructor() {
		this.experience = new Experience()
		this.active = window.location.hash === '#debug'

		if (this.active) {
			this.ui = new Pane({ title: '⚙️ Debug' })
			const uiContainer = this.ui.containerElem_
			const uiBindContainer = uiContainer.querySelector("[style='height: auto;']")
			uiContainer.style.position = 'fixed'
			uiContainer.style.userSelect = 'none'
			uiBindContainer.style.maxHeight = '80vh'
			uiBindContainer.style.overflowY = 'auto'

			this.setPlugins()
			this.setImportExportButtons()
			this.setMoveEvent()
			this.setResizeEvent()
			this.setResetButton()

			this.setDebugManager()

			if (this.debugParams.SceneLog) this.setSceneLog()
			if (this.debugParams.Stats) this.setStats()
		} else {
			sessionStorage.removeItem('debugParams')
		}
	}

	setPlugins() {
		this.ui.registerPlugin(TweakpaneEssentialsPlugin)
		this.ui.registerPlugin(TweakpanePluginMedia)
	}

	setImportExportButtons() {
		const handleExport = () => {
			const data = this.ui.exportState()
			const element = document.createElement('a')
			const file = new Blob([JSON.stringify(data)], {
				type: 'application/json',
			})
			element.href = URL.createObjectURL(file)
			element.download = 'preset.json'
			document.body.appendChild(element) // Required for this to work in FireFox
			element.click()
			element.remove()
		}

		const handleImport = () => {
			const input = document.createElement('input')
			input.type = 'file'
			input.accept = '.json'
			input.onchange = (event) => {
				const file = event.target.files[0]
				const reader = new FileReader()
				reader.onload = (event) => {
					const data = JSON.parse(event.target.result)
					this.ui.importState(data)
				}
				reader.readAsText(file)
			}
			input.click()
		}

		this.ui
			.addBlade({
				view: 'buttongrid',
				size: [2, 1],
				cells: (x, y) => ({
					title: [['Import', 'Export']][y][x],
				}),
			})
			.on('click', (event) => {
				if (event.index[0] === 0) {
					handleImport()
					return
				}
				handleExport()
			})
	}

	setMoveEvent() {
		const container = this.ui.containerElem_
		const titleElement = this.ui.element.children[0]
		titleElement.childNodes.forEach((child) => {
			child.style.pointerEvents = 'none'
		})
		let move = () => {}
		let hasMoved = true
		const handleMouseDown = (event) => {
			titleElement.style.cursor = 'grabbing'
			const clickTargetX = event.layerX
			const clickTargetWidth = event.target.clientWidth
			const clickTargetY = event.layerY

			move = ({ clientX, clientY }) => {
				hasMoved = true

				container.style.right = `${this.experience.sizes.width - clientX - (clickTargetWidth - clickTargetX)}px`
				container.style.top = `${clientY - clickTargetY}px`
			}

			document.addEventListener('mousemove', move)
		}
		const handleMouseUp = () => {
			titleElement.style.cursor = null

			if (hasMoved) {
				this.ui.controller.foldable.set('expanded', !this.ui.controller.foldable.get('expanded'))
				hasMoved = false
			}

			document.removeEventListener('mousemove', move)
		}

		titleElement.addEventListener('mousedown', handleMouseDown)
		titleElement.addEventListener('mouseup', handleMouseUp)
	}

	setResizeEvent() {
		const containerElement = this.ui.containerElem_
		containerElement.style.minWidth = '280px'

		const styleElement = document.createElement('style')
		styleElement.innerHTML = `
		.tp-lblv_v { flex-grow: 1 }
		.tp-lblv_l { min-width: 64px; max-width: 100px;}
		.horizontal-resize { position: absolute; left: -3px; top: 0; bottom: 0; width: 5px; cursor: ew-resize; }
		.horizontal-resize:hover { background-color: #ffffff10; }
		`
		document.head.appendChild(styleElement)

		const horizontalResizeElement = document.createElement('div')
		horizontalResizeElement.classList.add('horizontal-resize')
		containerElement.appendChild(horizontalResizeElement)

		horizontalResizeElement.addEventListener('mousedown', (event) => {
			containerElement.style.pointerEvents = 'none'
			const clickTargetX = event.clientX
			const clickTargetWidth = containerElement.clientWidth

			const handleMouseMove = ({ clientX }) => {
				containerElement.style.width = `${clickTargetWidth - (clientX - clickTargetX)}px`
			}

			const handleMouseUp = () => {
				document.removeEventListener('mousemove', handleMouseMove)
				document.removeEventListener('mouseup', handleMouseUp)
				containerElement.style.pointerEvents = ''
			}

			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		})
	}

	setResetButton() {
		const resetButton = document.createElement('button')
		resetButton.classList.add('tp-reset-button')
		const styleElement = document.createElement('style')
		styleElement.innerHTML = `
			.tp-reset-button {
				position: absolute;
				right: 0;
				top: 0;
				bottom: 0;
				width: 16px;
				height: 16px;
				margin: auto;
				stroke: #65656e;
				stroke-linecap: round;
				stroke-linejoin: round;
				stroke-width: 2;
				fill: none;
				background: none;
				border: none;
				cursor: pointer;
			}
			.tp-reset-button:hover {
				stroke: var(--btn-bg-h);
			}
		`
		document.head.appendChild(styleElement)

		resetButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-9-9C9 3 7 4 5 6L3 8m0 0V3m0 5h5m-5 4a9 9 0 0 0 9 9c3 0 5-1 7-3l2-2m0 0h-5m5 0v5"/></svg>`

		this.ui.pool_.createBindingApi = (function (original) {
			return function (bindingController) {
				const valueElement = bindingController.view.valueElement
				valueElement.style.position = 'relative'
				valueElement.style.paddingRight = '20px'
				const clonedResetButton = resetButton.cloneNode(true)
				valueElement.appendChild(clonedResetButton)

				const initialValue = bindingController.valueController.value.rawValue
				bindingController.value.emitter.on('change', ({ rawValue }) => {
					if (JSON.stringify(rawValue) === JSON.stringify(initialValue)) {
						clonedResetButton.style.stroke = ''
						return
					}
					clonedResetButton.style.stroke = 'var(--btn-bg-a)'
				})

				clonedResetButton.addEventListener('click', () => {
					bindingController.valueController.value.setRawValue(initialValue)
				})

				return original.apply(this, arguments)
			}
		})(this.ui.pool_.createBindingApi)
	}

	setDebugManager() {
		this.debugParams = {
			SceneLog: true,
			ResourceLog: true,
			Stats: true,
			LoadingScreen: true,
		}
		this.debugParams = JSON.parse(sessionStorage.getItem('debugParams')) || this.debugParams

		const debugManager = this.ui.addFolder({
			title: 'Debug Feature Manager',
			expanded: false,
		})

		const handleReset = () => {
			Object.keys(this.debugParams).forEach((key, index) => {
				this.debugParams[key] = true
				debugManager.children[index + 1].refresh()
			})
		}

		debugManager.addButton({ title: 'Reset Debug Manager' }).on('click', handleReset)

		Object.keys(this.debugParams).forEach((key) => {
			debugManager.addBinding(this.debugParams, key).on('change', ({ value }) => {
				sessionStorage.setItem('debugParams', JSON.stringify(this.debugParams))
				if (value) {
					if (this[`set${key}`]) this[`set${key}`]()
				} else {
					if (this[`unset${key}`]) this[`unset${key}`]()
				}
			})
		})
	}

	setSceneLog() {
		// debug message when something is added to the scene
		this.experience.scene.add = (function (original) {
			return function (object) {
				if (!object.devObject) {
					console.debug(
						`📦 %c${object.name ? object.name : `unnamed ${object.type}`}%c added to the scene`,
						'font-weight: bold; background-color: #ffffff20; padding: 0.1rem 0.3rem; border-radius: 0.3rem',
						'font-weight: normal',
						object,
					)
				}
				return original.apply(this, arguments)
			}
		})(this.experience.scene.add)
	}

	setStats() {
		this.statsJsPanel = new Stats()
		document.body.appendChild(this.statsJsPanel.domElement)
		const monitoringValues = [
			{
				name: 'Calls',
				value: () => this.experience.renderer.instance.info.render.calls,
			},
			{
				name: 'Triangles',
				value: () => this.experience.renderer.instance.info.render.triangles,
			},
			{
				name: 'Lines',
				value: () => this.experience.renderer.instance.info.render.lines,
			},
			{
				name: 'Points',
				value: () => this.experience.renderer.instance.info.render.points,
			},
			{
				name: 'Geometries',
				value: () => this.experience.renderer.instance.info.memory.geometries,
			},
			{
				name: 'Materials',
				value: () => this.experience.renderer.instance.info.programs.length,
			},
			{
				name: 'Textures',
				value: () => this.experience.renderer.instance.info.memory.textures,
			},
		]

		this.monitoringSection = document.createElement('section')
		Object.assign(this.monitoringSection.style, {
			position: 'fixed',
			bottom: '1rem',
			left: '1rem',
			pointerEvents: 'none',
			userSelect: 'none',
			zIndex: '1000',
			display: 'flex',
			gap: '1rem',
			fontSize: '12px',
			mixBlendMode: 'difference',
		})

		monitoringValues.forEach((monitoringValue) => {
			const monitoringValueElement = document.createElement('span')
			monitoringValueElement.id = monitoringValue.name.toLowerCase()
			monitoringValue.element = monitoringValueElement
			this.monitoringSection.appendChild(monitoringValueElement)
		})

		document.body.appendChild(this.monitoringSection)

		this.stats = {
			monitoringValues,
			update: () => {
				this.statsJsPanel.update()
				monitoringValues.forEach((monitoringValue) => {
					if (monitoringValue.value() === monitoringValue.lastValue) return
					monitoringValue.lastValue = monitoringValue.value()
					monitoringValue.element.innerHTML = `<b>${monitoringValue.lastValue}</b> ${monitoringValue.name}`
				})
			},
		}
	}
	unsetStats() {
		this.statsJsPanel.domElement.remove()
		this.monitoringSection.remove()
	}

	update() {
		if (this.active) {
			if (this.debugParams.Stats) this.stats.update()
		}
	}
}
