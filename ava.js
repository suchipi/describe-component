"use strict";

var makeDescribeComponent = require("./build/makeDescribeComponent");

module.exports = function makeDescribeComponentForAva(test) {
  return makeDescribeComponent({
    describe: function describe(description, callback) {
      callback();
    },
    beforeEach: function beforeEach(callback) {
      test.beforeEach(callback);
    },
    afterEach: function afterEach(callback) {
      test.afterEach(callback);
    },
    beforeEachName: "test.beforeEach"
  });
}
