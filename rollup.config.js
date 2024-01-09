import typescript from "rollup-plugin-typescript2";
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
import dotenv from "rollup-plugin-dotenv"


const config = [{
  input: 'src/index.ts',
  output: [{
    file: 'dist/browser/es/true-wallet-sdk.js',
    format: 'es',
    sourcemap: true,
    inlineDynamicImports: true,
  }, {
    file: 'dist/browser/esm/true-wallet-sdk.js',
    format: 'esm',
    sourcemap: true,
    inlineDynamicImports: true,
  }, {
    name: 'TrueWalletSDK',
    file: 'dist/browser/iife/true-wallet-sdk.js',
    format: 'iife',
    sourcemap: true,
    inlineDynamicImports: true,
  }, {
    name: 'browser',
    file: 'dist/browser/umd/true-wallet-sdk.js',
    format: 'umd',
    sourcemap: true,
    inlineDynamicImports: true,
  }],
  plugins: [
    dotenv.default(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs({transformMixedEsModules: true}),
    typescript(),
    // terser(),
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
    dotenv.default(),
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
