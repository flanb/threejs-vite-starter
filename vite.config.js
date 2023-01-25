import { defineConfig } from "vite";
import glslify from "vite-plugin-glslify";
import path from "path";

export default defineConfig({
  root: "src",
  publicDir: "../public",
  build: {
    outDir: "../dist",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      webgl: path.resolve(__dirname, "src/WebGL"),
      utils: path.resolve(__dirname, "src/WebGL/Utils"),
      scenes: path.resolve(__dirname, "src/WebGL/Scenes"),
      components: path.resolve(__dirname, "src/WebGL/Components"),
    },
  },
  plugins: [glslify.glslify()],
});
