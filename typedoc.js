module.exports = {
  out: 'api',
  exclude: ['**/node_modules/**', '**/*.test.ts', '**/*.json'],
  name: 'transmission-ts',
  excludePrivate: true,
  excludeInternal: true,
  readme: './README.md',
  plugin: ['typedoc-plugin-markdown', 'typedoc-plugin-missing-exports'],
  entryPoints: ['src/index.ts'],
};
