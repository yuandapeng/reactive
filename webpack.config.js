const path = require("path");

/**
 * @return {import('webpack').Configuration[]}
 */
module.exports = function (env, argv) {
  const mode = argv.mode || "development";

  const isProd = mode === "production";

  const filename = isProd ? "index.production.js" : "index.development.js";

  const clean = {
    keep: isProd ? "index.development.js" : "index.production.js",
  };

  const module = {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-typescript"],
            },
          },
          "ts-loader",
        ],
      },
    ],
  };

  const entry = "./src/index.ts";

  const resolve = {
    extensions: [".ts", ".tsx", ".js", ".json"], // 添加更多的扩展
  };

  return [
    // CJS 配置
    {
      mode: mode,
      entry: entry,
      output: {
        path: path.resolve(__dirname, "dist/cjs"),
        filename: filename,
        libraryTarget: "commonjs2",
        clean: clean,
      },
      module: module,
      resolve: resolve,
      plugins: [],
    },
    // ESM 配置
    {
      mode: mode,
      entry: entry,
      output: {
        path: path.resolve(__dirname, "dist/esm"),
        filename: filename,
        libraryTarget: "module",
        clean: clean,
      },
      module: module,
      experiments: {
        outputModule: true,
      },
      resolve: resolve,
      plugins: [],
    },
  ];
};
