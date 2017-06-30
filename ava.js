"use strict";

var makeDescribeComponent = require("./build/makeDescribeComponent");

module.exports = function makeDescribeComponentForAva(test) {
  return makeDescribeComponent({
    describe: (description, callback) => {
      callback();
    },
    beforeEach: (callback) => {
      test.beforeEach(callback);
    },
    afterEach: (callback) => {
      test.afterEach(callback);
    },
    beforeEachName: "test.beforeEach"
  });
}
