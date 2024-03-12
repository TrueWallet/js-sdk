import typescript from "rollup-plugin-typescript2";
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from "@rollup/plugin-terser";
import dotenv from "rollup-plugin-dotenv"
import { dts } from "rollup-plugin-dts";


const config = [{
  input: 'src/index.ts',
  output: [{
    file: 'dist/sdk.mjs',
    format: 'esm',
    plugins: [
      nodeResolve({
        browser: true,
        modulesOnly: true,
        preferBuiltins: false,
      }),
    ],
    inlineDynamicImports: true,
  }, {
    file: 'dist/sdk.cjs',
    format: 'cjs',
    plugins: [
      nodeResolve({
        browser: false,
        modulesOnly: true,
        preferBuiltins: true,
        exportConditions: ['node']
      }),
    ],
    inlineDynamicImports: true,
  }],
  sourcemap: true,
  treeshake: true,
  plugins: [
    dotenv.default(),
    commonjs({transformMixedEsModules: true}),
    typescript(),
    // terser(),
  ]
}, {
  input: "./dist/index.d.ts",
  output: [{ file: "./dist/sdk.d.ts" }],
  plugins: [dts()],
}];

export default config;
