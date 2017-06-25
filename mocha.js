"use strict";

var makeDescribeComponent = require("./build/makeDescribeComponent");

module.exports = makeDescribeComponent({
  describe: global.describe,
  beforeEach: global.beforeEach,
  afterEach: global.afterEach,
  beforeEachName: "beforeEach"
});
