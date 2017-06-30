const path = require("path");

module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: [
      "test/**/*.js",
    ],
    preprocessors: {
      "test/**/*.js": ["webpack", "sourcemap"],
    },
    reporters: ["progress"],
    webpack: {
      devtool: "inline-source-map",
      module: {
        loaders: [
          {
            test: /\.js$/,
            loader: "babel-loader",
            exclude: path.resolve(__dirname, "node_modules"),
          },
          {
            test: /\.json$/,
            loader: "json-loader",
          },
        ],
      },
      externals: {
        "react-addons-test-utils": "react",
        "react/addons": "react",
        "react/lib/ExecutionEnvironment": "react",
        "react/lib/ReactContext": "react",
      },
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    singleRun: false,
  })
};
