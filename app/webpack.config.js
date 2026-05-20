const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  const publicPath = process.env.PUBLIC_URL || '/';
  config.output.publicPath = publicPath.endsWith('/') ? publicPath : publicPath + '/';

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(
        process.env.REACT_APP_API_URL || 'http://localhost:3000'
      ),
    })
  );

  return config;
};
