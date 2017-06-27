# describe-component

`describe-component` provides a test helper function called `describeComponent`
that removes the boilerplate when writing unit tests for React components with
enzyme.

Here's what it looks like (using Jest for this example):
```js
import React from "react";
import describeComponent from "describe-component/jest";

const ColorableDiv = ({ color, children }) => (
  <div data-component-name="ColorableDiv" style={color ? { color } : undefined}>
    {children}
  </div>
);

describeComponent(ColorableDiv, ({ mountWrapper: colorableDiv, setProps }) => {
  it("renders a div", () => {
    expect(colorableDiv().find("div")).toHaveLength(1);
  });

  it("sets the data-component-name attribute on that div to 'ColorableDiv'", () => {
    expect(colorableDiv().find("div").props()).toMatchObject({
      "data-component-name": "ColorableDiv",
    });
  });

  describe("with children", () => {
    beforeEach(() => {
      setProps({ children: <span id="some-child" /> });
    });

    it("passes its children to the div", () => {
      expect(colorableDiv().find("#some-child")).toHaveLength(1);
    });
  });

  describe("with a color", () => {
    beforeEach(() => {
      setProps({ color: "red" });
    });

    it("sets the inline style of the div", () => {
      expect(colorableDiv().find("div").props().style).toMatchObject({
        color: "red",
      });
    });
  });

  describe("with no color", () => {
    it("sets no inline styles", () => {
      const style = colorableDiv().find("div").props().style;
      expect(style).not.toBeDefined();
    });
  });
});
```

It's inspired by [RSpec's `let`](https://relishapp.com/rspec/rspec-core/v/2-5/docs/helper-methods/let-and-let).
Here's how it works:
* You call `describeComponent` with a component class or function and a
  callback.
* Your callback is synchronously called with a set of helper functions.
* In your callback, you use the `setProps` and `clearProps` helpers to set the
  props you want to render your component with.
* In your callback, you call `mountWrapper`, `shallowWrapper`, or
  `renderWrapper` to Full Render (enzyme `mount`), Shallow Render (enzyme
  `shallow`) or Render to Static Markup (enzyme `render`) the component you are
  testing, using the props you set earlier.

## Helper methods documentation

Your callback to `describeComponent` gets called with the following helper
methods:

### mountWrapper

A wrapper around enzyme's `mount` that will mount your component (using the
props set up with `setProps` and `clearProps`), and return the ReactWrapper
instance created by `mount`. It is memoized, so it will only call `mount` once
per test, and subsequent calls will return the first ReactWrapper instance. The
component will be unmounted automatically after each test.

Type definition:
```js
mountWrapper: () => ReactWrapper
```

### shallowWrapper

A wrapper around enzyme's `shallow` that will shallow render your component
(using the props set up with `setProps` and `clearProps`), and return the
ShallowWrapper instance created by `shallow`. It is memoized, so it will only
call `shallow` once per test, and subsequent calls will return the first
ShallowWrapper instance. The component will be unmounted automatically after
each test.

Type definition:
```js
shallowWrapper: () => ShallowWrapper
```

### renderWrapper

A wrapper around enzyme's `render` that will render your component to static
markup (using the props set up with `setProps` and `clearProps`), and return the
CheerioWrapper instance created by `render`. Unlike `mountWrapper` and
`shallowWrapper`, it is NOT memoized.

Type definition:
```js
renderWrapper: () => CheerioWrapper
```

### setProps

A function which will add to the props that the component will eventually be
rendered with (when `mountWrapper`, `shallowWrapper`, or `renderWrapper` are
called).

You call it with an object whose key/value pairs correspond to prop
names and values:
```js
setProps({ color: "red", name: "foo" });
// The props to be rendered with are now color="red" name="foo"
```

It shallowly mixes in the props you pass into the props that have
already been set, much like a React Component's `setState` method.
```js
setProps({ color: "red" });
setProps({ name: "foo" });
// The props to be rendered with are now color="red" name="foo"
```

This behavior is useful when using nested describes to describe different
states your component can be in as a result of the props it received:
```js
describe("when a color prop is passed", () => {
  beforeEach(() => setProps({ color: "red" }));

  describe("and a name prop is passed", () => {
    beforeEach(() => setProps({ name: "foo" }));

    it("does something", () => {
      // Your test goes here
    });
  });
});
```

When using `mountWrapper` or `shallowWrapper`, you should only use `setProps`
before the first time you call `mountWrapper`/`shallowWrapper`. If you try to
use it after the component has already rendered, an error will be thrown asking
you to use the `setProps` method on the ReactWrapper/ShallowWrapper returned
from `mountWrapper`/`shallowWrapper` instead. This is because changing props
for an already-rendered component will go through a different code path than
setting the props for a component before mounting it, so it's important not to
mix the two up in your tests.

However, when using `renderWrapper`, the returned CheerioWrapper has no
`setProps` method on it, because it has no concept of React or lifecycle
methods, it just has the HTML. Because of this, the output from `renderWrapper`
is not "stateful", so calling `setProps` after rendering is allowed, and will
NOT throw an error. This use-case (calling setProps/clearProps and re-rendering)
is why `renderWrapper` isn't memoized.

Type definition:
```js
setProps: (Object) => void
```

### clearProps

A function which will clear all the props previously set up with `setProps`.
```js
setProps({ foo: "bar" });
// props is now foo="bar"
clearProps();
// props is now empty
```

This can be useful when you're in a deeply nested describe callback and want to
start over with known empty props.

When using `mountWrapper` or `shallowWrapper`, you should only use `clearProps`
before the first time you call `mountWrapper`/`shallowWrapper`. If you try to
use it after the component has already rendered, an error will be thrown asking
you to use the `setProps` method on the ReactWrapper/ShallowWrapper returned
from `mountWrapper`/`shallowWrapper` instead. This is because changing props
for an already-rendered component will go through a different code path than
setting the props for a component before mounting it, so it's important not to
mix the two up in your tests.

However, when using `renderWrapper`, the returned CheerioWrapper has no
`setProps` method on it, because it has no concept of React or lifecycle
methods, it just has the HTML. Because of this, the output from `renderWrapper`
is not "stateful", so calling `clearProps` after rendering is allowed, and will
NOT throw an error. This use-case (calling setProps/clearProps and re-rendering)
is why `renderWrapper` isn't memoized.

Type definition:
```js
clearProps: () => void
```

### props

A function which will return the props currently set.
```js
setProps({ one: "two" });
props(); // { one: "two" }
setProps({ three: "four" });
props(); // { one: "two", three: "four" }
```

This can be useful when you want to assert that a component passes a prop
through without modifying it, but you don't want to repeat the value of the prop
in your test (or you want to verify reference equality without making a binding
to the passed prop).
```js
const Card = ({ children }) => (
  <div className="card">
    {children}
  </div>
);

describeComponent(Card, ({ setProps, props, mountWrapper: card }) => {
  describe("when children are passed", () => {
    beforeEach(() => setProps({ children: <span id="some-child" /> }));

    it("passes them through to its root div", () => {
      const rootDiv = card().find("div").first();
      expect(rootDiv.props().children).toBe(props().children);
    });
  });
});
```

Type definition:
```js
props: () => Object
```

## Usage (Test Runner Configuration)

### Jest
```js
import describeComponent from "describe-component/jest";
import MyComponent from "./MyComponent";

describeComponent(MyComponent, ({
  // It's common to only use one of mountWrapper, shallowWrapper, or
  // renderWrapper, and rename the one you use to match the name of
  // your component. In this example, we'll use mountWrapper
  mountWrapper: myComponent,
  // shallowWrapper,
  // renderWrapper,

  // Helpers that set the props for the component to be rendered with
  setProps, // Call with an object to merge into the props
  clearProps, // Call to clear the props

  props, // Returns the props that the component will be/was rendered with.
}) => {
  // Write your tests here
});
```

### Mocha
```js
import describeComponent from "describe-component/mocha";
import MyComponent from "./MyComponent";

describeComponent(MyComponent, ({
  // It's common to only use one of mountWrapper, shallowWrapper, or
  // renderWrapper, and rename the one you use to match the name of
  // your component. In this example, we'll use mountWrapper
  mountWrapper: myComponent,
  // shallowWrapper,
  // renderWrapper,

  // Helpers that set the props for the component to be rendered with
  setProps, // Call with an object to merge into the props
  clearProps, // Call to clear the props

  props, // Returns the props that the component will be/was rendered with.
}) => {
  // Write your tests here
});
```

### Jasmine
```js
import describeComponent from "describe-component/jasmine";
import MyComponent from "./MyComponent";

describeComponent(MyComponent, ({
  // It's common to only use one of mountWrapper, shallowWrapper, or
  // renderWrapper, and rename the one you use to match the name of
  // your component. In this example, we'll use mountWrapper
  mountWrapper: myComponent,
  // shallowWrapper,
  // renderWrapper,

  // Helpers that set the props for the component to be rendered with
  setProps, // Call with an object to merge into the props
  clearProps, // Call to clear the props

  props, // Returns the props that the component will be/was rendered with.
}) => {
  // Write your tests here
});
```

### AVA
TODO (will be available via `require("describe-component/ava")` someday)

### Tape
TODO (will be available via `require("describe-component/tape")` someday)

### Generic/Other
```js
// If your test runner isn't listed or supported yet, you can configure
// describe-component manually to work with your test runner.
import makeDescribeComponent from "describe-component";
import MyComponent from "./MyComponent";

const describeComponent = makeDescribeComponent({
  // A function that works like jest/jasmine/mocha's `describe`; that is, it
  // declares a "context" about what you're testing. describeComponent will only
  // use it once (passing in the component's name).
  describe: global.describe,

  // A function that registers the callback it receives to be run before each
  // test in the `describe` block, like jest/jasmine/mocha's `beforeEach`.
  // describeComponent will only call it once, inside the callback it passes
  // to your `describe` function.
  beforeEach: global.beforeEach,

  // A function that registers the callback it receives to be run after each
  // test in the `describe` block, like jest/jasmine/mocha's `afterEach`.
  // describeComponent will only call it once, inside the callback it passes
  // to your `describe` function.
  afterEach: global.afterEach,

  // The name of the function a user can use to set up "before each" callbacks.
  // This is only used in error messages.
  beforeEachName: "beforeEach",
});

// Call describeComponent normally
describeComponent(MyComponent, ...);
```

## License

MIT
