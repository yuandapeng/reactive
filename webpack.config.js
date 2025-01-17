// webpack.config.js
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = function (env, argv) {
  const mode = argv.mode || "development";
  return [
    // CJS 配置
    {
      mode,
      entry: "./src/index.ts",
      output: {
        path: path.resolve(__dirname, "dist/cjs"),
        filename: "index.js",
        libraryTarget: "commonjs2",
      },
      module: {
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
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"], // 添加更多的扩展
      },
      plugins: [new CleanWebpackPlugin()],
    },
    // ESM 配置
    {
      mode,
      entry: "./src/index.ts",
      output: {
        path: path.resolve(__dirname, "dist/esm"),
        filename: "index.js",
        libraryTarget: "module",
      },
      module: {
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
      },
      experiments: {
        outputModule: true,
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"], // 添加更多的扩展
      },
      plugins: [new CleanWebpackPlugin()],
    },
  ];
};
