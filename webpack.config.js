const path = require("path");
const { OptimizationStages } = require("webpack");

module.exports = {
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "bundle.js",
  },

  optimization: {
    minimize: true,
  },
  /* devtool: "inline-source-map",
  devServer: {
    // Добавьте или измените эту секцию
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000,
    devMiddleware: {
      mimeTypes: { js: "application/javascript" }, // Явное указание MIME-типа
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js"],
  },*/
};
