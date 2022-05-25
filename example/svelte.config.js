import autoImport from '../src/index.js';

export default {
  kit: {
    vite: {
      plugins: [
        autoImport({
					dts: "./src/components-auto-imports.d.ts",
          components: [
            './src/components',

            /* custom prefix */
            { name: './src/routes/_shared', prefix: 'Shared' },
          ],

          module: {
            svelte: ['onMount']
          },
        })

      ]
    }
  }
}
