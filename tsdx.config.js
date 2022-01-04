const peerDeps = require('rollup-plugin-peer-deps-external');

module.exports = {
  rollup(config, options) {
    // config.plugins.unshift(peerDeps());
    // console.log(config, 'config.plugins');
    // config.external = ['electron'];
    return config;
  },
};
