import { defineConfig } from 'vite'
import glslify from 'vite-plugin-glslify'
import path from 'path'

export default defineConfig({
	root: 'src',
	publicDir: '../public',
	build: {
		outDir: '../dist',
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			webgl: path.resolve(__dirname, 'src/webgl'),
			utils: path.resolve(__dirname, 'src/webgl/utils'),
			scenes: path.resolve(__dirname, 'src/webgl/scenes'),
			components: path.resolve(__dirname, 'src/webgl/components'),
			core: path.resolve(__dirname, 'src/webgl/core'),
		},
	},
	plugins: [glslify.glslify()],
})
