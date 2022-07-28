import typescript from '@rollup/plugin-typescript';
import path from 'path';
import del from 'rollup-plugin-delete';
import dts from 'rollup-plugin-dts';

import pkg from './package.json';

const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/index.ts',
    plugins: [
      del({ targets: ['./dist'], runOnce: !production, }),
      typescript({
        tsconfig: path.join(__dirname, 'tsconfig.json'),
        declaration: true,
        declarationDir: 'dts'
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
    ],
    external: [/@qubizapps\/.*/, /@nestjs\/.*/, /node:.*/, 'lodash'],
  },
  // bundle all type definitions into one file
  {
    input: 'dist/dts/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [
      dts(),
      del({
        targets: ['./dist/dts'],
        hook: 'buildEnd',
      }),
    ],
  },
];
