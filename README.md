[![(a histogram of downloads)](https://nodei.co/npm-dl/fghi-url.png?height=3)](https://npmjs.org/package/fghi-url)

## FGHI URL

This repository contains draft standards of Uniform Resource Locators for the Fidonet Global Hypertext Interface project.

* The [`FidoURL.txt`](FidoURL.txt) file is the English version of the draft.

* The [`FidoURL.rus.txt`](FidoURL.rus.txt) file is the Russian version of the draft. This version is provided in UTF-8 (for the diffs to look reasonably good on GitHub and other git tools) and thus should be converted to CP866 encoding (common in Russian Fidonet) before posting to Fidonet.

This repository does also contain a JavaScript module (for Node.js) as a proof of concept and a reference implementation. It is tested against Node.js v0.10.x, Node.js v0.12.x, Node.js v4.0.x and the latest stable version of io.js.

## Versions

Both drafts of the standards are “nightly builds” of 0.5pre version, dated 8 Apr 2010 (and after that date any regular updating of the 0.5pre drafts was abandoned).

The JavaScript module is compatible with the drafts (though not completely covered by tests to prove that). The module also contains some additional features from the FGHI TODO list (circa 2010, and not included in this repository), these are not yet documented formally in the drafts.

## Installing the module

[![(npm package version)](https://nodei.co/npm/fghi-url.png?downloads=true&downloadRank=true)](https://npmjs.org/package/fghi-url)

* Latest packaged version: `npm install fghi-url`

* Latest githubbed version: `npm install https://github.com/Mithgol/FGHI-URL/tarball/master`

You may visit https://github.com/Mithgol/FGHI-URL occasionally to read the latest `README` and the drafts of the FGHI URL standard. The package's version is planned to grow after code changes only. (And `npm publish --force` is [forbidden](http://blog.npmjs.org/post/77758351673/no-more-npm-publish-f) nowadays.)

## Using the module

When you `require()` the installed module, an URL parser function is returned.

You may call that function (with some FGHI URL as its only parameter), and it returns an object with properties that correspond to parts of the given URL.

(An URL parser function is actually that object's constructor, but using the word `new` is optional.)

Example:

![(screenshot)](https://f.cloud.github.com/assets/1088720/1048572/e0243df8-108e-11e3-8316-84ee29732f02.gif)

## Properties

The returned object has the following properties:

* `scheme` — The name of the given FGHI URL's scheme (one of the documented: `'netmail'`, `'areafix'`, `'echomail'`, `'area'`, `'faqserv'`, `'fecho'`, `'freq'`).

* `schemeSpecificPart` — The rest of the URL (everything after the separator that followed the scheme). The meaning of its contents is specific to the given scheme.

* `requiredPart` — The required part of the URL (everything before the first `?` character in `schemeSpecificPart`; or the entire `schemeSpecificPart`, if there's no `?`).

* `optionalPart` — The optional part of the URL (everything after the first `?` character; an empty string, if there's no `?`).

* `optionalParams` — An array of optional parameters encountered in `optionalPart`. Each parameter is an object that has two properties (`name` and `value`).

* `request` — The request (for `faqserv://…` URLs only; empty for URLs of other types).

* `station` — The address of the target station in Fidonet.

* `stationZone`, `stationNet`, `stationNode`, `stationPoint`, `stationDomain` — Parts of the 5D `station` address.

* `objectPath` — The path to a designated object (if any).

* `objectPathParts` — Array of the parts of that path (that were slash-separated in `objectPath`). If `objectPath` ends with a slash, the last element of the array is `'/'`.

* `echoNames` — An array of the fully-qualified names of Fidonet echomail areas. Each element is also an array and contains parts of such name (that were `@`-separated in the URL).

If an error is encountered, the parser throws `new Error('…')` with one of the ten predefined strings (error descriptions). You may see these strings in the bottom of `index.js`.

## Methods

The returned object also has following methods:

### hasFilters()

Returns `true` if the object's `scheme` is `"area"` and its `optionalPart` contains at least one filter.

Returns `false` otherwise. For `area://…` URLs it means that the designated object is the whole area(s) unless `objectPath` is given.

### getView(supportedViews)

Accepts `supportedViews` (the list of views supported by a browser) in a form of a string (such as `'list totr'`, where view tokens are space-separated) or an array of string (such as `['list', 'totr']`). If several views are supported, their tokens must be given in the order of preference.

Returns the token of an URL-recommended view (if the given URL recommends a browser-supported view) or an empty string.

If several supported views are recommended, the most preferred view's token is returned. For example,

* `require('fghi-url')('area://Example?view=list+tree+sing').getView('sing cale tree')` returns `'tree'` (that is the most preferred of the URL's recommendations supported by the browser),

* `require('fghi-url')('area://Example?view=tree&view=sing').getView('sing cale tree')` returns `'sing'` (among the equally preferred recommendations of the URL that was the most preferred by the browser).

## Testing the module

[![(build testing status)](https://img.shields.io/travis/Mithgol/FGHI-URL/master.svg?style=plastic)](https://travis-ci.org/Mithgol/FGHI-URL)

It is necessary to install [Mocha](http://visionmedia.github.io/mocha/) and [JSHint](http://jshint.com/) for testing.

* You may install Mocha globally (`npm install mocha -g`) or locally (`npm install mocha` in the directory of the FGHI URL module).

* You may install JSHint globally (`npm install jshint -g`) or locally (`npm install jshint` in the directory of the FGHI URL module).

After that you may run `npm test` (in the directory of the FGHI URL module) for testing.

## License

Distribution of the FGHI URL standards is unlimited (see section 1), provided that the text is not altered without notice.

The JavaScript code is MIT-licensed (see the `LICENSE` file).