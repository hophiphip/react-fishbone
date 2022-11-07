import path from 'path';
import { build } from "esbuild";

import cssModulesPlugin from 'esbuild-css-modules-plugin';

import { dependencies } from "../package.json";

const entry = path.resolve(__dirname, "../src/index.ts");
const target = 'ESNext';

const options = {
    bundle: true,
    entryPoints: [entry],
    external: Object.keys(dependencies),
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