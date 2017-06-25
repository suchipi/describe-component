// @flow
const React = require("react");
const { mount, shallow, render } = require("enzyme");
const startsWith = require("core-js/library/fn/string/starts-with");

import type { ReactWrapper, ShallowWrapper } from "enzyme";
type CheerioWrapper = any; // No type available yet

const startsWithVowel = (str) => {
  const lower = str.toLowerCase();
  return startsWith(lower, "a") ||
    startsWith(lower, "e") ||
    startsWith(lower, "i") ||
    startsWith(lower, "o") ||
    startsWith(lower, "u");
};

module.exports = function makeDescribeComponent({
  describe,
  beforeEach,
  afterEach,
  beforeEachName,
}: {
  describe: (string, () => void) => void,
  beforeEach: (() => (void | Promise<any>)) => void,
  afterEach: (() => (void | Promise<any>)) => void,
  beforeEachName: string,
}) {
  return function describeComponent(
    Component: Class<React.Component<any, any, any>> | (Object, ?Object) => React.Element<any> | null,
    callback: ({
      mountWrapper: () => ReactWrapper,
      shallowWrapper: () => ShallowWrapper,
      renderWrapper: () => CheerioWrapper,
      setProps: (Object) => void,
      props: () => Object,
      clearProps: () => void,
    }) => void
  ) {
    const name = Component.displayName ||
      Component.name ||
      "Anonymous Component";

    describe(name, () => {
      let props;
      let mountedWrapper;
      let shallowRenderedWrapper;
      let renderedWrapper;

      beforeEach(() => {
        props = {};
        mountedWrapper = undefined;
        shallowRenderedWrapper = undefined;
        renderedWrapper = undefined;
      });

      afterEach(() => {
        if (mountedWrapper) {
          mountedWrapper.unmount();
        }
        if (shallowRenderedWrapper) {
          shallowRenderedWrapper.unmount();
        }
      });

      function mountWrapper() {
        if (!mountedWrapper) {
          mountedWrapper = mount(
            React.createElement(Component, props)
          );
        }
        return mountedWrapper;
      }

      function shallowWrapper() {
        if (!shallowRenderedWrapper) {
          shallowRenderedWrapper = shallow(
            React.createElement(Component, props)
          );
        }
        return shallowRenderedWrapper;
      }

      function renderWrapper() {
        if (!renderedWrapper) {
          renderedWrapper = render(
            React.createElement(Component, props)
          );
        }
        return renderedWrapper;
      }

      function getProps() {
        return props;
      }

      function throwIfAlreadyUsed(functionName) {
        if (mountedWrapper || shallowRenderedWrapper || renderedWrapper) {
          let message = (verbed, verbing, wrapperFn) =>
            "You are trying to change props for " +
            `${startsWithVowel(name) ? "an" : "a"} ${name} that has already ` +
            `been ${verbed}. \`${functionName}\` is intended to be used ` +
            `before ${verbing} the component (for example, in `+
            `\`${beforeEachName}\` calls).` +
            (wrapperFn.match(/(?:mount|shallow)Wrapper/) ? (
              ` If you want an already-${verbed.replace(" ", "-")} component ` +
              `to receive new props, call \`setProps\` on the wrapper object ` +
              `returned from ${wrapperFn}.`
            ) : "");


          if (mountedWrapper && shallowRenderedWrapper && renderedWrapper) {
            throw new Error(message(
              "mounted or rendered or shallow rendered",
              "mounting or rendering or shallow rendering",
              "`mountWrapper` or `shallowWrapper`"
            ));
          } else if (mountedWrapper && shallowRenderedWrapper) {
            throw new Error(message(
              "mounted or shallow rendered",
              "mounting or shallow rendering",
              "`mountWrapper` or `shallowWrapper`"
            ));
          } else if (mountedWrapper && renderedWrapper) {
            throw new Error(message(
              "mounted or rendered",
              "mounting or rendering",
              "`mountWrapper` or `renderWrapper`"
            ));
          } else if (shallowRenderedWrapper && renderedWrapper) {
            throw new Error(message(
              "rendered or shallow rendered",
              "rendering or shallow rendering",
              "`renderWrapper` or `shallowWrapper`"
            ));
          } else if (mountedWrapper) {
            throw new Error(message("mounted", "mounting", "`mountWrapper`"));
          } else if (shallowRenderedWrapper) {
            throw new Error(message(
              "shallow rendered",
              "shallow rendering",
              "`shallowWrapper`"
            ));
          } else if (renderedWrapper) {
            throw new Error(message(
              "rendered",
              "rendering",
              "`renderWrapper`"
            ));
          }
        }
      }

      function setProps(newProps) {
        throwIfAlreadyUsed("setProps");
        Object.assign(props, newProps);
      }

      function clearProps() {
        throwIfAlreadyUsed("clearProps");
        props = {};
      }

      callback({
        mountWrapper,
        shallowWrapper,
        renderWrapper,
        setProps,
        props: getProps,
        clearProps,
      });
    });
  };
};
