const path = require('path');
const webpack = require('webpack');

process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

async function build() {
  const createExpoWebpackConfigAsync = require('@expo/webpack-config');
  const config = await createExpoWebpackConfigAsync(
    { projectRoot: __dirname, platform: 'web', mode: 'production' },
    { mode: 'production' }
  );

  const publicPath = process.env.PUBLIC_URL || '/';
  config.output.publicPath = publicPath.endsWith('/') ? publicPath : publicPath + '/';
  config.output.path = path.resolve(__dirname, '..', 'web-build');

  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify(
        process.env.REACT_APP_API_URL || 'http://localhost:3000'
      ),
    })
  );

  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) { console.error(err); reject(err); return; }
      if (stats.hasErrors()) {
        const info = stats.toJson();
        info.errors.forEach((e) => console.error(e.message || e));
        reject(new Error('Build failed'));
        return;
      }
      console.log(stats.toString({ colors: true, chunks: false, modules: false }));
      console.log('\nBuild complete →', config.output.path);
      resolve();
    });
  });
}

build().catch((err) => { console.error(err); process.exit(1); });
