import webpack from 'webpack';
import config from '../webpack.config.prod';

process.env.NODE_ENV = 'production';

webpack(config).run((error, stats) => {
  if (error) {
    return 1;
  }

  const jsonStats = stats.toJson();

  if (jsonStats.hasErrors) {
    return jsonStats.errors.map(error => console.log(error));
  }

  if (jsonStats.hasWarnings) {
    jsonStats.warnings.map(warning => console.log(warning));
  }

  return 0;
});
