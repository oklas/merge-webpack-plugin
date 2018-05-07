var fs = require("fs");
var path = require("path");
var expect = require("expect");
var webpack = require("webpack");
var rimraf = require("rimraf");
var MergePlugin = require("../index");

var packageDir = path.join(__dirname, "package");
var distDir = path.join(__dirname, "dist");

describe("merge-webpack-plugin", function() {
  var baseWebpackConfig;

  beforeEach(function() {
    baseWebpackConfig = {
      context: packageDir,
      entry: "./index",
      output: {
        path: distDir,
        libraryTarget: "umd"
      }
    };
  });

  afterEach(function(done) {
    rimraf(distDir, done);
  });
  afterEach(function(done) {
    rimraf(path.join(packageDir, "index.js"), done);
  });

  it("should merge yaml files with additional loader", function(done) {
    var webpackConfig = Object.assign({}, baseWebpackConfig, {
      module: {
        rules: [
          {
            test: /\.(yaml)$/i,
            use: [
              MergePlugin.loader({ name: "result.[hash].yaml" }),
              "yaml-loader"
            ]
          }
        ]
      },
      plugins: [
        new MergePlugin({
          search: "./src/**/*.yaml"
        })
      ]
    });

    var indexJs = `
    module.exports = {
      data: require("./src/yaml/data.yaml"),
      empty: require("./src/yaml/empty.yaml"),
      target: require("./src/yaml/target.yaml")
    }`;
    fs.writeFileSync(path.join(packageDir, "index.js"), indexJs);

    webpack(webpackConfig, function(err, stats) {
      if (err) return done(err);
      if (stats.hasErrors()) return done(new Error(stats.toString()));

      var bundle = require(path.join(distDir, "main.js"));
      expect(bundle.data).toMatch(/^result.\S+.yaml/);
      expect(bundle.data).toEqual(bundle.empty);
      expect(bundle.data).toEqual(bundle.target);

      var mergedYAML = JSON.parse(
        fs.readFileSync(path.join(distDir, bundle.data), "utf-8")
      );
      expect(mergedYAML).toEqual({
        key: {
          a: 1,
          b: 2
        },
        ru: "Привет!"
      });

      done();
    });
  });
});
