import typescript from "rollup-plugin-typescript2";
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";


const config = [{
  input: 'src/index.ts',
  output: [{
    file: 'dist/esm/index.js',
    format: 'esm',
    sourcemap: true,
    inlineDynamicImports: true,
  }],
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({transformMixedEsModules: true}),
    typescript(),
    terser(),
  ]
}, {
  input: 'src/index.ts',
  external: ['cross-fetch', 'cross-fetch/polyfill'],
  output: [{
    dir: 'dist/cjs',
    format: 'cjs',
    sourcemap: true,
    inlineDynamicImports: true,
  }],
  plugins: [
    nodeResolve({
      browser: false,
      preferBuiltins: true,
      exportConditions: ['node']
    }),
    commonjs({transformMixedEsModules: true}),
    typescript(),
    terser(),
  ]
}];

export default config;
