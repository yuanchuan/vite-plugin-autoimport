
import { createFilter } from '@rollup/pluginutils';
import type { Plugin } from 'vite'
import { enforcePluginOrdering, resolveSveltePreprocessor } from './lib/configHelpers.js';
import type { ImportMapping, PluginUserConfig, Preprocessor } from './types.js';
import { genrateAST } from './lib/transformHelpers.js';
import { transformCode } from './lib/transformCode.js';
import { createMapping } from './lib/componentMapping/createMapping.js';
import { standardizeConfing } from './lib/config/standardizedConfig.js';

export default function autowire(userConfig: PluginUserConfig = {}): Plugin {

  const { components, mapping, module, include, exclude } = standardizeConfing(userConfig)

  const filter = createFilter(include, [
    ...exclude,
    '**/node_modules/**',
    '**/.git/**',
    '**/.svelte-kit/**',
    '**/.svelte/**'
  ]);

  /* The directories in which componenty may be present. Watch these for changes */
  const componentPaths: any[] = components.map(comp => comp.directory);

  let importMapping: ImportMapping = {};
  let sveltePreprocessor: Preprocessor | undefined;

  function updateMapping() {
    importMapping = createMapping(components, module, mapping, filter);
  }


  updateMapping();

  return {
    name: 'sveltekit-autowire',

    enforce: 'pre',

    // Must be processed before vite-plugin-svelte
    async configResolved(config) {
      enforcePluginOrdering(config.plugins);
      sveltePreprocessor = await resolveSveltePreprocessor(config);
    },

    async transform(code, filename) {
      if (!filter(filename)) return;
      const ast = await genrateAST(code, sveltePreprocessor, filename)
      return transformCode(code, ast, filename, importMapping);
    },

    configureServer(server) {
      if (componentPaths.length) {
        server.watcher
          .add(componentPaths)
          .on('add', updateMapping)
          .on('unlink', updateMapping);
      }
    }
  }
}
