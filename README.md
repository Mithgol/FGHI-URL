# FGHI URL

This repository contains draft standards of Uniform Resource Locators for the Fidonet Global Hypertext Interface project.

* The `FidoURL.txt` file is the English version of the draft.

* The `FidoURL.rus.txt` file is the Russian version of the draft. This version is provided in UTF-8 (for the diffs to look reasonably good on GitHub and other git tools) and thus should be converted to CP866 encoding (common in Russian Fidonet) before posting to Fidonet.

This repository does also contain a JavaScript module (for Node.js) as a proof of concept and a reference implementation.

# Versions

Both drafts of the standards are “nightly builds” of 0.5pre version, dated 8 Apr 2010 (and after that date any regular updating of the 0.5pre drafts was abandoned).

The JavaScript module is currently outdated (it does not support even v0.4 features). Its upgrade is in progress.

# Installing the module

[![(npm package version)](https://badge.fury.io/js/fghi-url.png)](https://npmjs.org/package/fghi-url)

* Latest packaged version: `npm install fghi-url`

* Latest githubbed version: `npm install https://github.com/Mithgol/FGHI-URL/tarball/master`

You may visit https://github.com/Mithgol/FGHI-URL occasionally to read the latest `README` and the drafts of the FGHI URL standard. The package's version is planned to grow after code changes only. (However, `npm publish --force` may happen eventually.)

# Testing the module

[![(build testing status)](https://travis-ci.org/Mithgol/FGHI-URL.png?branch=master)](https://travis-ci.org/Mithgol/FGHI-URL)

It is necessary to install [Mocha](http://visionmedia.github.io/mocha/) and [JSHint](http://jshint.com/) for testing.

* You may install Mocha globally (`npm install mocha -g`) or locally (`npm install mocha` in the directory of the FGHI URL module).

* You may install JSHint globally (`npm install jshint -g`) or locally (`npm install jshint` in the directory of the FGHI URL module).

After that you may run `npm test` (in the directory of the FGHI URL module) for testing.

# License

Distribution of the FGHI URL standards is unlimited (see section 1), provided that the text is not altered without notice.

The JavaScript code is MIT-licensed (see the `LICENSE` file).