import path from 'path';
import { build } from "esbuild";
import { fileURLToPath } from 'url';

import cssModulesPlugin from 'esbuild-css-modules-plugin';
import packageJson from "../package.json" assert { type: "json" };

// .ts-modules/.mjs files do not have __dirname accessible, so we define our own
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const entry = path.resolve(__dirname, "../src/index.ts");
const target = 'ESNext';

const options = {
    bundle: true,
    entryPoints: [entry],
    external: Object.keys(packageJson.dependencies),
    minify: true,
    sourcemap: true,
    target: [target],
    plugins: [
        cssModulesPlugin({
            inject: false,
            filter: /\.modules?\.css$/i,
        })
    ],
};

build({
    ...options,
    format: "esm",
    outfile: "./dist/index.js",
});