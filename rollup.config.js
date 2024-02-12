import typescript from "rollup-plugin-typescript2";
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
import dotenv from "rollup-plugin-dotenv"
import generatePackageJson from "rollup-plugin-generate-package-json";


const config = [{
  input: 'src/index.ts',
  output: [{
    file: 'dist/esm/index.js',
    format: 'esm',
    sourcemap: true,
    inlineDynamicImports: true,
  }],
  treeshake: true,
  plugins: [
    dotenv.default(),
    nodeResolve({
      browser: true,
      modulesOnly: true,
      preferBuiltins: false,
    }),
    commonjs({transformMixedEsModules: true}),
    typescript(),
    terser(),
    generatePackageJson({
      baseContents: {
        type: 'module',
        types: 'dist/esm/index.d.ts',
      },
    })
  ]
}, {
  input: 'src/index.ts',
  output: [{
    dir: 'dist/cjs',
    format: 'cjs',
    sourcemap: true,
    inlineDynamicImports: true,
  }],
  treeshake: true,
  plugins: [
    dotenv.default(),
    nodeResolve({
      browser: false,
      modulesOnly: true,
      preferBuiltins: true,
      exportConditions: ['node']
    }),
    commonjs({transformMixedEsModules: true}),
    typescript(),
    terser(),
    generatePackageJson({
      baseContents: {
        type: 'commonjs',
        types: 'dist/cjs/index.d.ts',
      },
    }),
  ]
}];

export default config;
