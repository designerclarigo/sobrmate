const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Keep native builds responsive on developer machines with many logical CPUs.
config.maxWorkers = 2;

module.exports = config;
