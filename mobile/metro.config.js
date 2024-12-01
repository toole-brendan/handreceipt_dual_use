const path = require('path');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
    assetExts: ['png', 'jpg', 'jpeg', 'gif'],
  },
  watchFolders: [path.resolve(__dirname)],
  projectRoot: path.resolve(__dirname),
};

