export default {
  entry: "./Game.mjs",
  mode: "development",
  output: {
    filename: "./bundle.js",
  },
  resolve: {
    extensions: [".mjs", ".js", ".jsx", ".json"],
  },
  devtool: "source-map",
};
