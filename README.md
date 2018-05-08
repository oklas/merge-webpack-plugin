[![npm][npm-image]][npm-url]
[![travis-cl][travis-image]][travis-url]
[![coverage][cover-image]][cover-url]

# merge plugin for webpack


- [Install](#install)
- [Webpack configuration](#webpack-configuration)
- [Requiring](#requiring)
- [Plugin configuration](#plugin-configuration)
- [Loader configuration](#loader-configuration)
- [Grouping](#grouping)


Webpack plugin with loader for merge sources

This is **[webpack](https://webpack.js.org/)** plugin produces single asset
for set of files or multiple assets with grouping technique. The set of files
may be splited to groups of set of files that produce group of assets.


**Advantages**:

* deep webpack integration
* possibility to group files by simple criterion
* autorebuild and reload on source file change (due to deep integration)
* files may be loaded and joined by path pattern or by call function
  `require` or `import`


To build internationalization locale assets consider to use also
the **[intl-webpack-plugin](https://github.com/oklas/intl-webpack-plugin)**

If need some like this merge plugin but more specifical - fork this plugin
and read more about:
**[join-webpack-plugin](https://github.com/oklas/join-webpack-plugin)**
(from which this merge plugin is derived).


## Install

```bash
npm install --save-dev merge-webpack-plugin
```


## Webpack configuration

This is minimal configuration to merge json into single asset:

``` javascript
var MergePlugin = require("merge-webpack-plugin");
module.exports = {
  module: {
    rules: [
      { test: /\.(json)$/i,
        use: [
          MergePlugin.loader()
        ]
      },
      // another formats to merge is possible with loaders
      { test: /\.(yaml)$/i,
        use: [
          MergePlugin.loader(),
          'yaml-loader'
        ]
      },
    ]
  },
  plugins: [
    new MergePlugin({
      search: './src/**/*.json',
    })
  ]
}
```


## Requiring

``` javascript
var url1 = require("one-of-files.json");
// and/or if preloaders specified, for example 'yaml-loader'
var url2 = require("another-file.yaml");
require("third-file.yaml");
// or describe files by pattern in plugin param

// url1 and url2 will be same name refers to same file
// which will also contain content of "third-file.yaml"
```

Same in modern syntax:

``` jsx
import url1 from "one-of-files.json"
import url2 from "another-file.yaml"
import "third-file.yaml"
// or describe files by pattern in plugin param
```


This returns public url of file with result of merging.
This will be same url for each file merged together
according to plugin configuration.

In order to involve files into merge, files must be required by `require`
function of `import` or configured by `search` param of plugin configuration.


## Plugin configuration

MergePlugin typically created at webpack configuration file and
wait hash of configuration options as its create param:

``` javascript
var MergePlugin = require("merge-webpack-plugin");

var merge = new MergePlugin({
  search: 'glob' || ['globs',...],
  skip: 'substr' || /regexp/ || [ 'substr', /regex/, ...],
  group: '[name]',
  sort: true || false, // Default false
  name: '[name].[hash].[ext]',
});
```

Options:

* **`search`** - glob pattern or pattern array to find and prefetch
  see [glob](https://www.npmjs.com/package/glob) module for reference
* `skip` - substring or regular expression or array to skip some from searched results
* `group` - default group loader option (see below)
* `sort` - sort output by keys to avoid change `[hash]`
* `name` - default name loader option (see below)

The `search` param works like multi-require with glob patterns.
Only files that required by `require` function in code
will be loaded in that case.

Any file that does not match to `search` or `skip` param and
match to loader section in webpack config and is required in code
by function `require` or `import` will be loaded and merged anyway.


## Loader configuration

The `loader()` method includes merge loader into loader chain.

``` javascript
var MergePlugin = require("merge-webpack-plugin");
var theMerge = new MergePlugin({...})

{
  module: {
    rules: [
      { test: /\.(json)$/i,
        use: [
          theMerge.loader({group:'[name]'}),
         // some more pre loaders
        ]
      }
    ]
  }
  plugins: [
     theMerge
  ]
}

```

Preliminary loaders must be applied before merge loader. This means that
merge loader must be final loader in loaders chain.

Loader function waits hash of configuration options as its param.
Default values of loader may be specified in plugin configuration
described above.

Loader options:

* `group` - devides files into separated assets by specifying
  groping pattern. May include template placeholders described
  below in groupping section. Grouping is not applied if
  value is not specified.
* `name` - specifies destination asset file name. String value
  may include template placeholders described below. Default
  value is `[hash]`.

Configuration values specified directly in `loader()` override
same values specified as default in plugin configuration.


The `loader()` function may be invoked as class function if only one plugin
instance is passed to config. Therefore it is better to use object form
instead of class form:

``` javascript
var theMerge = new MergePlugin({...})

loaders: [
  // this form valid only for single plugin instance:
  MergePlugin.loader(),
  // to avoid problems better to use always object form:
  theMerge.loader(),
],
```


## Grouping

Files may be grouped by simple criterion. Grouping criterion is
specified in `group` loader param. If `group` param is not
specified than will be only one common group where will be
all files joined togather.

Grouping criteria formed by template placeholders described
in `interpolateName()` from [loader-utils](https://github.com/webpack/loader-utils#interpolatename) module.
Some of that is:

* `[name]` - to group files with same name set group param:
* `[ext]` - to group files with same ext set group param:
* `[path]` - to group files where each group contains files from same directory:

And any derivative combinations.


## LICENSE

#### [MIT](./LICENSE.md)

[npm-image]: https://img.shields.io/npm/v/merge-webpack-plugin.svg
[npm-url]: https://npmjs.com/package/merge-webpack-plugin
[travis-image]: https://travis-ci.org/oklas/merge-webpack-plugin.svg
[travis-url]: https://travis-ci.org/oklas/merge-webpack-plugin
[cover-image]: https://img.shields.io/codecov/c/github/oklas/merge-webpack-plugin.svg
[cover-url]: https://codecov.io/gh/oklas/merge-webpack-plugin
