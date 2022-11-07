const path = require('path');
const { build } = require("esbuild");

const cssModulesPlugin = require('esbuild-css-modules-plugin');

const { dependencies } = require("../package.json");

const entry = path.resolve(__dirname, "../src/index.ts");
const target = 'ESNext';

const options = {
    bundle: true,
    entryPoints: [entry],
    external: Object.keys(dependencies),
    logLevel: "info",
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