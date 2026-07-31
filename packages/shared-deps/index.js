const dependencies = require('./dependencies.json');

/**
 * @param {{ eager: boolean }} options
 * @returns {Record<string, { singleton: boolean; eager: boolean; version: string; requiredVersion: string }>}
 */
function getSharedDependencies({ eager }) {
  return Object.fromEntries(
    Object.entries(dependencies)
      .map(([dep, version]) => [
        dep,
        { singleton: true, eager, version, requiredVersion: version },
      ]),
  );
}

module.exports = { getSharedDependencies };
