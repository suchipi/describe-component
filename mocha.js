"use strict";

var makeDescribeComponent = require("./build/makeDescribeComponent");

module.exports = makeDescribeComponent({
  describe: global.describe,
  // Intentionally strip mocha's optional description string from beforeEach and
  // afterEach, rather than calling global.beforeEach and global.afterEach
  // directly. If you don't do this, watch mode WILL break.
  beforeEach: function beforeEach(callback) {
    return global.beforeEach.call(this, callback);
  },
  afterEach: function afterEach(callback) {
    return global.afterEach.call(this, callback);
  },
  beforeEachName: "beforeEach"
});
