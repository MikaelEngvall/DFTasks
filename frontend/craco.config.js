const path = require("path");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CompressionPlugin = require("compression-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Ta bort default service worker plugin
      webpackConfig.plugins = webpackConfig.plugins.filter(
        (plugin) => plugin.constructor.name !== "InjectManifest"
      );

      // Optimera chunk-storlekar
      webpackConfig.optimization.splitChunks = {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          // Separata chunks för stora paket
          reactVendor: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: "vendor-react",
            chunks: "all",
          },
          utilityVendor: {
            test: /[\\/]node_modules[\\/](lodash|date-fns|axios)[\\/]/,
            name: "vendor-utilities",
            chunks: "all",
          },
          i18nVendor: {
            test: /[\\/]node_modules[\\/](i18next|react-i18next)[\\/]/,
            name: "vendor-i18n",
            chunks: "all",
          },
        },
      };

      // Aktivera tree shaking
      webpackConfig.optimization.usedExports = true;
      webpackConfig.optimization.sideEffects = true;

      // Lägg till Terser för minifiering
      webpackConfig.optimization.minimize = true;
      webpackConfig.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ];

      // Lägg till plugins för produktion
      if (env === "production") {
        webpackConfig.plugins.push(
          new CompressionPlugin({
            algorithm: "gzip",
            test: /\.(js|css|html|svg)$/,
            threshold: 10240,
            minRatio: 0.8,
          }),
          new BundleAnalyzerPlugin({
            analyzerMode: "disabled",
            generateStatsFile: true,
            statsFilename: "bundle-stats.json",
          }),
          new InjectManifest({
            swSrc: "./src/service-worker.ts",
            swDest: "service-worker.js",
            exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          })
        );
      }

      return webpackConfig;
    },
  },
};
