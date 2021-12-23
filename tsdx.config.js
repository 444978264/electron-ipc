module.exports = {
  rollup(config, options) {
    config.external = ['electron'];
    return config;
  },
};
