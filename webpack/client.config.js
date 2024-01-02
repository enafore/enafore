import { DEFAULT_LOCALE, LOCALE } from "../src/routes/_static/intl.js";
import path from "path";
import webpack from "webpack";
import config from "sapper/config/webpack.js";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import terser from "./terser.config.js";
import CircularDependencyPlugin from "circular-dependency-plugin";
import {
  dev,
  inlineSvgs,
  isUpstream,
  mode,
  resolve,
  version,
} from "./shared.config.js";
import VirtualModulesPlugin from "webpack-virtual-modules";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import urlRegex from "../src/routes/_utils/urlRegexSource.js";
// TODO: make it so we don't have to list these out explicitly
import fr from "emoji-picker-element/i18n/fr.js";
import de from "emoji-picker-element/i18n/de.js";
import es from "emoji-picker-element/i18n/es.js";

const emojiPickerLocales = { fr, de, es };

const emojiPickerI18n = LOCALE !== DEFAULT_LOCALE && emojiPickerLocales[LOCALE];

const output = Object.assign(config.client.output(), {
  // enables HMR in workers
  globalObject: "this",
  filename: dev ? "[fullhash]/[id].js" : "[id].[contenthash].[name].js",
  chunkFilename: dev ? "[fullhash]/[id].js" : "[id].[contenthash].[name].js",
});
if (output.publicPath[0] !== "/") {
  output.publicPath = "/" + output.publicPath;
}

process.on("unhandledRejection", (err) => {
  // TODO: seems to be a Webpack Bundle Analyzer error we can safely ignore
  if (
    !err.message.includes(
      "Error: No such label 'done hook' for WebpackLogger.timeEnd()",
    )
  ) {
    console.error(err);
  }
});

export default {
  entry: config.client.entry(),
  output,
  resolve,
  mode,
  module: {
    rules: [
      {
        test: (input) => {
          return input.endsWith(path.join("_workers", "blurhash.js"));
        },
        use: {
          loader: "worker-loader",
          options: {
            filename: dev
              ? "[fullhash]/blurhash.[name].js"
              : "blurhash.[contenthash].[name].js",
          },
        },
      },
      {
        test: (input) => {
          return input.endsWith(path.join("_workers", "processContent.js"));
        },
        use: {
          loader: "worker-loader",
          options: {
            filename: dev
              ? "[fullhash]/processContent.[name].js"
              : "processContent.[contenthash].[name].js",
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          path.join(__dirname, "./csso-loader.cjs"),
        ],
      },
      {
        test: /tesseract\.js\/dist\/worker\.min\.js$/,
        type: "asset/resource",
      },
      {
        test: /\.[tj]s$/,
        exclude: /node_modules/,
        use: {
          loader: path.join(__dirname, "./svelte-intl-loader.cjs"),
        },
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "svelte-loader",
            options: {
              dev,
              hydratable: true,
              store: true,
              hotReload: dev,
              emitCss: true,
            },
          },
          {
            loader: path.join(__dirname, "./svelte-intl-loader.cjs"),
          },
        ],
      },
    ].filter(Boolean),
  },
  optimization: dev ? {} : {
    minimize: !process.env.DEBUG,
    minimizer: [
      terser()
    ],
    // TODO: we should be able to enable this, but Sapper breaks if we do so
    // // isolate runtime chunk to avoid excessive cache invalidations https://webpack.js.org/guides/caching/
    // runtimeChunk: 'single',
    splitChunks: {
      chunks: "async",
      minSize: 5000,
      maxAsyncRequests: Infinity,
      maxInitialRequests: Infinity
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      ignoreOrder: true,
      filename: dev ? "[fullhash]/[id].css" : "[id].[contenthash].[name].css",
      chunkFilename: dev ? "[fullhash]/[id].css" : "[id].[contenthash].[name].css",
    }),
    new VirtualModulesPlugin(),
    new webpack.DefinePlugin({
      "process.browser": true,
      "process.env.NODE_ENV": JSON.stringify(mode),
      "process.env.INLINE_SVGS": JSON.stringify(inlineSvgs),
      "process.env.URL_REGEX": urlRegex().toString(),
      "process.env.LOCALE": JSON.stringify(LOCALE),
      "process.env.EMOJI_PICKER_I18N": emojiPickerI18n
        ? JSON.stringify(emojiPickerI18n)
        : "undefined",
      "process.env.PINAFORE_VERSION": JSON.stringify(version),
      "process.env.IS_SERVICE_WORKER": "false",
      "process.env.THEME_COLORS": "null",
      "process.env.UPSTREAM": isUpstream,
    }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      cwd: process.cwd(),
    }),
    dev && new webpack.HotModuleReplacementPlugin({
      requestTimeout: 120000,
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      logLevel: "silent",
      generateStatsFile: true,
    }),
  ].filter(Boolean),
  devtool: dev ? "inline-source-map" : "source-map",
  performance: {
    hints: dev ? false : (process.env.DEBUG ? "warning" : "error"),
    assetFilter: (assetFilename) => {
      return !/\.map$|tesseract-asset|\$(polyfill|katex)\$/.test(assetFilename);
    },
  },
};
