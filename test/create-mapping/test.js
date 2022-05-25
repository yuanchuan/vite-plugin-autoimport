import path from 'path';
import { statSync, unlink, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { createFilter } from '@rollup/pluginutils';
import { createMapping } from '../../src/lib.js';

function resolve(name) {
  let __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(__dirname, name);
}

let [mapping, paths] = createMapping({
  components: resolve('./components'),
  filter: createFilter(['**/*.svelte']),
  module: {
    svelte: ['onMount as mount', 'onDestroy']
  },
  dts: './components-auto-imports.d.ts',
});

const generatedDTS = `// Generated by 'sveltekit-autoimport'
export {}
declare global {
const A: typeof import('../test/create-mapping/components/a.svelte')['default']
const B: typeof import('../test/create-mapping/components/b.svelte')['default']
const LibC: typeof import('../test/create-mapping/components/lib/c.svelte')['default']
}
`

test('create mapping', () => {
  const dts_path = resolve('../../components-auto-imports.d.ts') 

  expect(statSync(dts_path).isFile()).toEqual(true)

  expect(readFileSync(dts_path,{encoding: 'utf8'})).toEqual(generatedDTS)

  unlink(dts_path, () => {});

  expect(Object.keys(mapping))
    .toEqual(['A', 'B', 'LibC', 'mount', 'onDestroy']);

  expect(paths)
    .toEqual([resolve('./components')]);
  
});
