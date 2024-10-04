import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const sourceFolder = "src/";
const libEntry = `${sourceFolder}index.ts`;

export default defineConfig({
	build: {
		lib: {
			name: "fishbone-layout",
			entry: resolve(__dirname, libEntry),
			formats: ["es"],
			fileName: "index",
		},
	},
	resolve: {
		alias: {
			src: resolve(sourceFolder),
		},
	},
	plugins: [
		dts({
			tsconfigPath: "./tsconfig.lib.json",
		}),
	],
});
