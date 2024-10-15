import { Mesh, OrthographicCamera, PlaneGeometry, Scene, WebGLRenderer, WebGLRenderTarget } from 'three'

/**
 * Creates a render target shader.
 *
 * @param {Object} options - Options for creating the render target shader.
 * @param {WebGLRenderer} options.renderer - The WebGL renderer.
 * @param {number} options.width - The width of the render target.
 * @param {number} options.height - The height of the render target.
 * @param {ShaderMaterial} options.material - The shader material to use.
 * @returns {Object} An object containing the render function, render target, material, mesh, scene, camera, and geometry.
 */
export function createRenderTargetShader(options) {
	const renderer = options.renderer
	const renderTarget = new WebGLRenderTarget(options.width, options.height, {
		// minFilter: NearestFilter,
		// magFilter: NearestFilter,
		// colorSpace: SRGBColorSpace,
	})
	const scene = new Scene()
	const camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 1)
	camera.position.z = 1
	const geometry = new PlaneGeometry()
	const mesh = new Mesh(geometry, options.material)
	scene.add(mesh)

	function render(renderInScene = false) {
		if (!renderer) return
		mesh.material = options.material
		if (renderInScene) {
			renderer.render(scene, camera)
			return
		}

		renderTarget.texture.needsUpdate = true
		renderer.setRenderTarget(renderTarget)
		renderer.state.buffers.depth.setMask(true)
		renderer.render(scene, camera)
		renderer.setRenderTarget(null)
	}

	return {
		render,
		renderTarget,
		material: options.material,
		mesh,
		scene,
		camera,
		geometry,
	}
}
