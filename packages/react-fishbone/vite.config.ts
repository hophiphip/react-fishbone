import { extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { glob } from "glob";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import packageJson from "./package.json";

/** ------------------------------------------------------------------ */

const sourceFolder = "src/";
const sourceEntries = `${sourceFolder}**/*.{ts,tsx}`;
const sourceEntry = `${sourceFolder}index.ts`;

const peerDependencies = Object.keys(packageJson.peerDependencies);

const externalDependencies = [...peerDependencies, "react/jsx-runtime"];

/** ------------------------------------------------------------------ */

function getRelativePathToSourceFolder(file: string) {
	return relative(sourceFolder, file.slice(0, file.length - extname(file).length));
}

const sourcesInput = Object.fromEntries(
	glob
		.sync(sourceEntries)
		.map((file) => [
			getRelativePathToSourceFolder(file),
			fileURLToPath(new URL(file, import.meta.url)),
		]),
);

/** ------------------------------------------------------------------ */

export default defineConfig({
	build: {
		copyPublicDir: false,
		lib: {
			name: "react-fishbone",
			entry: resolve(__dirname, sourceEntry),
			formats: ["es"],
			fileName: "index",
		},
		rollupOptions: {
			external: externalDependencies,
			input: sourcesInput,
			output: {
				assetFileNames: "assets/[name][extname]",
				entryFileNames: "[name].js",
			},
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
		react(),
	],
});
