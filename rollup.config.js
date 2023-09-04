import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";


const config = [{
    input: 'src/index.ts',
    output: [{
        dir: 'dist/browser/esm',
        format: 'esm',
        sourcemap: true,
        inlineDynamicImports: true,
    }, {
        dir: 'dist/browser/iife',
        format: 'iife',
        sourcemap: true,
        inlineDynamicImports: true,
    }, {
        name: 'browser',
        dir: 'dist/browser/umd',
        format: 'umd',
        sourcemap: true,
        inlineDynamicImports: true,
    }],
    plugins: [
        typescript(),
        terser(),
    ]
}, {
    input: 'src/index.ts',
    output: [{
        dir: 'dist/node/cjs',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
    }, {
        dir: 'dist/node/es',
        format: 'es',
        sourcemap: true,
        inlineDynamicImports: true,
    }],
    plugins: [
        typescript(),
        terser(),
    ]
}];

export default config;
