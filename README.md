# describe-component

`describe-component` is an easy-to-use React unit testing library that removes
all your boilerplate code from your tests.

It codifies a pattern for unit testing using
[Enzyme](https://github.com/airbnb/enzyme) so that your tests are all
consistently written. With `describe-component`, anyone can read, understand,
and change a unit test for a React component.

Here's what it looks like. This example is for [Jest](#jest), but
`describe-component` also works in [Mocha](#mocha), [Jasmine](#jasmine),
[AVA](#ava), or
[any other test framework with beforeEach and afterEach](#genericother).
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

Here's how it works:
* You call `describeComponent` with a component class or function and a
  callback.
* Your callback is synchronously called with a set of helper functions.
* In your callback, you use the `setProps` and `clearProps` helpers to set the
  props you want to render your component with.
* In your callback, you call `mountWrapper`, `shallowWrapper`, or
  `renderWrapper` to use Enzyme's
  [`mount`](https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md),
  [`shallow`](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md),
  or [`render`](https://github.com/airbnb/enzyme/blob/master/docs/api/render.md)
  functions on the component you are testing, using the props you set earlier.

## Installation

With yarn:
```sh
$ yarn add --dev describe-component
```

With npm:
```sh
$ npm install --save-dev describe-component
```

If you don't have them already, you will also need React and Enzyme installed.
See the [Enzyme installation instructions](https://github.com/airbnb/enzyme#installation)
for info on how to install Enzyme.

## Documentation

### describeComponent
#### describeComponent(Component, callbackFunction) => undefined

Creates a wrapping `describe` for the Component's display name, sets up a bunch
of boilerplate, and calls back your `callbackFunction`.

```js
// This...
describeComponent(FishCake, ({ mountWrapper: fishCake, setProps }) => {
  // Tests go here
});

// ... is roughly the same as this:
import { mount } from "enzyme";

describe("FishCake", () => {
  let props;
  let mountedFishCake;

  beforeEach(() => {
    props = {};
    mountedFishCake = undefined;
  });

  afterEach(() => {
    if (mountedFishCake) {
      mountedFishCake.unmount();
    }
  });

  const setProps = (newProps) => {
    Object.assign(props, newProps);
  };

  const fishCake = () => {
    if (!mountedFishCake) {
      mountedFishCake = mount(
        <FishCake {...props} />
      );
    }
    return mountedFishCake;
  };

  // Tests go here
});
```

Your `callbackFunction` gets called with an object that has the
following helper methods on it: [`mountWrapper`](#mountwrapper),
[`shallowWrapper`](#shallowwrapper), [`renderWrapper`](#renderwrapper),
[`setProps`](#setprops), [`clearProps`](#clearprops), and [`props`](#props).

### mountWrapper
#### `mountWrapper([enzymeOptions]) => ReactWrapper`

A wrapper around Enzyme's [`mount`](https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md)
that will mount your component (using the props set by `setProps` and
`clearProps`), and return the
[ReactWrapper](https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md)
created by `mount`.

```js
// This...
const card = mount(<PlayingCard kind="7" suit="CLUBS" />);

// ... is roughly the same as this:
describeComponent(PlayingCard, ({ mountWrapper, setProps }) => {
  setProps({ kind: "7", suit: "CLUBS" });
  const card = mountWrapper();
});
```

If present, the options passed into mountWrapper will be passed into Enzyme's
`mount` as the second argument. 
```js
// This...
const card = mount(
  <PlayingCard kind="7" suit="CLUBS" />,
  { context: { kind: "bicycleBlue" } }
);

// ... is roughly the same as this:
describeComponent(PlayingCard, ({ mountWrapper, setProps }) => {
  setProps({ kind: "7", suit: "CLUBS" });
  const card = mountWrapper({ context: { kind: "bicycleBlue" } });
});
```

`mountWrapper` is memoized, so it will only call `mount` once per test, and
subsequent calls will return the first ReactWrapper instance.

```js
mountWrapper() === mountWrapper(); // true
```

This means that you can use `mountWrapper` as many times as you want without any
performance penalty:

```js
expect(mountWrapper().find(".upper-left-card-label").text()).toBe("7");
expect(mountWrapper().find(".bottom-right-card-label").text()).toBe("7");
```

Usually when you use `mountWrapper`, you rename it so that its name matches the
name of the component under test, but written in lowerCamelCase:
```js

describeComponent(NailPolish, ({ mountWrapper: nailPolish, setProps }) => {
  it("uses its color prop as the background color for the .bottle-contents it renders", () => {
    setProps({ color: "firebrick" });
    expect(nailPolish().find(".bottle-contents").props().style.backgroundColor).toBe("firebrick");
  });
});
```

The `ReactWrapper` created by `mountWrapper` will be unmounted automatically
after each test.

### shallowWrapper
#### `shallowWrapper([enzymeOptions]) => ShallowWrapper`

A wrapper around Enzyme's [`shallow`](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md)
that will shallow-render your component (using the props set by `setProps`
and `clearProps`), and return the
[ShallowWrapper](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md)
created by `shallow`.

```js
// This...
const flavor = shallow(
  <CupcakeFlavor sweetness={6} saltiness={2} name="Salted Caramel" />
);

// ... is roughly the same as this:
describeComponent(CupcakeFlavor, ({ shallowWrapper, setProps }) => {
  setProps({ sweetness: 6 saltiness: 2 name: "Salted Caramel" });
  const flavor = shallowWrapper();
});
```

If present, the options passed into shallowWrapper will be passed into Enzyme's
`shallow` as the second argument.
```js
// This...
const flavor = shallow(
  <CupcakeFlavor sweetness={6} saltiness={2} name="Salted Caramel" />,
  { context: { linerColor: "pink" } }
);

// ... is roughly the same as this:
describeComponent(CupcakeFlavor, ({ shallowWrapper, setProps }) => {
  setProps({ sweetness: 6 saltiness: 2 name: "Salted Caramel" });
  const flavor = shallowWrapper({ context: { linerColor: "pink" } });
});
```

`shallowWrapper` is memoized, so it will only call `shallow` once per test, and
subsequent calls will return the first ShallowWrapper instance.

```js
shallowWrapper() === shallowWrapper(); // true
```

This means that you can use `shallowWrapper` as many times as you want without
any performance penalty:

```js
expect(shallowWrapper().find(".healthiness").text()).toBe("very bad");
expect(shallowWrapper().find(".tastiness").text()).toBe("very good");
```

Usually when you use `shallowWrapper`, you rename it so that its name matches
the name of the component under test, but written in lowerCamelCase:

```js
describeComponent(PuffyCloud, ({ shallowWrapper: puffyCloud, setProps }) => {
  it("renders an img whose src is the cloud image that matches the provided shape", () => {
    setProps({ shape: "small puppy" });
    expect(puffyCloud().find("img").props().src).toBe(cloudImages["small puppy"]);
  });
});
```

The `ShallowWrapper` created by `shallowWrapper` will be unmounted automatically
after each test.

### renderWrapper
#### `renderWrapper([enzymeOptions]) => CheerioWrapper`

A wrapper around Enzyme's [`render`](https://github.com/airbnb/enzyme/blob/master/docs/api/render.md)
that will render your component to static markup (using the props set by
`setProps` and `clearProps`), and return the
[CheerioWrapper](https://github.com/airbnb/enzyme/blob/master/docs/api/render.md)
created by `render`.

```js
// This...
const shades = render(
  <AwesomeSunglasses framesColor="black" lensesColor="indigo" />
);

// ... is roughly the same as this:
describeComponent(AwesomeSunglasses, ({ renderWrapper, setProps }) => {
  setProps({ framesColor: "black", lensesColor: "indigo" });
  const shades = renderWrapper();
});
```

If present, the options passed into renderWrapper will be passed into Enzyme's
`render` as the second argument.
```js
// This...
const shades = render(
  <AwesomeSunglasses framesColor="black" lensesColor="indigo" />,
  { context: { insuranceProvider: "Acme Insurance" } }
);

// ... is roughly the same as this:
describeComponent(AwesomeSunglasses, ({ renderWrapper, setProps }) => {
  setProps({ framesColor: "black", lensesColor: "indigo" });
  const shades = renderWrapper({ context: { insuranceProvider: "Acme Insurance" } });
});
```

Unlike [`mountWrapper`](#mountwrapper) and [`shallowWrapper`](#shallowwrapper),
`renderWrapper` is NOT memoized, so it will call `render` every time you call
`renderWrapper`.

```js
renderWrapper() === renderWrapper(); // false
```

Usually when you use `renderWrapper`, you rename it so that its name matches
the name of the component under test, but written in lowerCamelCase:

```js
describeComponent(RockinGuitar, ({ shallowWrapper: rockinGuitar, setProps }) => {
  it("renders an audio element whose src is set based on the tone prop", () => {
    setProps({ tone: "squeedly-wow!" });
    expect(rockinGuitar().find("audio").props().src).toBe("overdrive.wav");
  });
});
```

### setProps
#### `setProps(Object) => undefined`

A function which sets the props to render the component with.

You call it with an object whose key/value pairs correspond to prop
names and values:

```js
setProps({ wantsShampoo: true, deluxeCut: false });
// The props are now wantsShampoo={true} deluxeCut={false}
```

Once you've called it, you can then use [`mountWrapper`](#mountwrapper),
[`shallowWrapper`](#shallowwrapper), or [`renderWrapper`](#renderwrapper) to
render the component.

```js
setProps({ hairstyle: "large and in charge" });
mountWrapper();
```

If you call it more than once, it does NOT replace the existing props; instead,
it shallowly mixes the props you pass into the existing props, much like a
React Component's `setState` method:

```js
setProps({ pedicure: true });
setProps({ manicure: false });
// The props are now pedicure={true} manicure={false}
```

This behavior is useful when using nested describes to describe different
states your component can be in as a result of the props it received:

```js
describe("when `pedicure` is true", () => {
  beforeEach(() => setProps({ pedicure: true }));

  describe("and `manicure` is false", () => {
    beforeEach(() => setProps({ manicure: false }));

    it("has an expected appointment duration of 30 minutes", () => {
      // Your test goes here
    });
  });
});
```

If you want to clear all the props, use the [`clearProps`](#clearprops)
function.

When using [`mountWrapper`](#mountwrapper) or
[`shallowWrapper`](#shallowwrapper), you may only use `setProps` before the
first time you call `mountWrapper`/`shallowWrapper`. If you try to use it after
the component has rendered, an error will be thrown. If you want change the
props of an already-mounted component, you should use the `setProps` method on
the `ReactWrapper`/`ShallowWrapper` returned from `mountWrapper`/`shallowWrapper`
instead:

```js
// instead of this
mountWrapper();
setProps({ "here's": "some", new: "props" }); // ❌ ERROR!

// do this
mountWrapper();
mountWrapper().setProps({ okay: "but", really: "though" }); // All good! 👍
```

The reason `describe-component` doesn't treat these two forms interchangeably is
that changing the props of an already-rendered component will go through a
different code path (`componentWillReceiveProps`) than setting the props for a
component before mounting it (`componentWillMount`), so it's important not
to mix up the two.

```js
class EnthusiasticComponent extends React.Component {
  componentWillMount() {
    console.log("Time to mount! Here's my props:", this.props);
  }

  componentWillReceiveProps(nextProps) {
    console.log("Already mounted! Receiving some new props, too:", nextProps);
  }
}

describeComponent(EnthusiasticComponent, ({ mountWrapper: enthusiasticComponent, setProps }) => {
  setProps({ ice: "cream" });
  enthusiasticComponent(); // Time to mount! Here's my props: { ice: "cream" }
  enthusiasticComponent().setProps({ sand: "wich" }); // Already mounted! Receiving some new props, too: { ice: "cream", sand: "wich" }
})
```

However, when using [`renderWrapper`](#renderwrapper), calling `setProps` after
rendering is totally fine:

```js
renderWrapper();
setProps({ please: "work" }); // Sure thing! 😀
```

The decision was made to allow this in this case because a
[`CheerioWrapper`](https://github.com/airbnb/enzyme/blob/master/docs/api/render.md)
has some significant differences when compared to a
[`ReactWrapper`](https://github.com/airbnb/enzyme/blob/master/docs/api/mount.md)
or
[`ShallowWrapper`](https://github.com/airbnb/enzyme/blob/master/docs/api/shallow.md):

* A `CheerioWrapper` contains static HTML markup, with no knowledge of React or
component lifecycle methods. All your component instances go away once rendering
is complete.
* Because of this, a `CheerioWrapper` does not have a `setProps` method on it.

These differences would make a `CheerioWrapper` hard to work with if you were
not allowed to call `setProps` after rendering one:

```js
// Okay, I want to verify that this component has the same html when
// I give it the prop colors={["white", "gold"]} as when I give it
// colors={["blue", "black"]}.
describeComponent(ThatDress, ({ renderWrapper: thatDress, setProps }) => {
  setProps({ colors: ["white", "gold"] });
  const htmlWhenWhiteGold = thatDress().html();
  // If setProps wasn't allowed to be called here, there'd be no way to compare
  // to new props, because thatDress().setProps() doesn't exist when using
  // renderWrapper.
  setProps({ colors: ["blue", "black"] });
  const htmlWhenBlueBlack = thatDress().html();

  expect(htmlWhenWhiteGold).toBe(htmlWhenBlueBlack);
});
```

### clearProps
#### `clearProps() => undefined`

A function which will clear all the props set by `setProps`.
```js
setProps({ chunky: "bacon" });
// props is now chunky="bacon"
clearProps();
// props is now empty
```

The same rules apply to `clearProps` as they do to [`setProps`](#setprops):
namely, you cannot call `clearProps` after [`mountWrapper`](#mountwrapper) or
[`shallowWrapper`](#shallowwrapper) have been called.

### props
#### `props() => Object`

A function which will return the current props.
```js
setProps({ one: "two" });
props(); // { one: "two" }
setProps({ three: "four" });
props(); // { one: "two", three: "four" }
setProps({ can: "I", have: "a", little: "more" });
props(); // { one: "two", three: "four", can: "I", have: "a", little: "more" }
```

This can be useful when you want to write an assertion that props got spread
onto a rendered component without checking every single prop key and value:

```js
const TheGreatDelegator = (props) => (
  <a href="https://www.xkcd.com/1790/" {...props}>
    No, YOU deal with this.
  </a>
)

describeComponent(TheGreatDelegator, ({ mountWrapper: delegator, setProps }) => {
  it("sends all its props right on through to an anchor element", () => {
    setProps({
      "I've": "got",
      "99": "problems",
      "but": "a",
      "potty": "mouth",
      "ain't": "one",
    });
    const anchor = delegator().find("a");
    expect(anchor.props()).toMatchObject(props());
  });
});
```

It can also be useful when you want to verify that a specific prop was threaded
through to a rendered component, without saving the value of the prop in a
variable:

```js
const GoodLuckClickingThis = ({ onClick }) => (
  <div onClick={onClick} />
);

describeComponent(GoodLuckClickingThis, ({ mountWrapper: goodLuck, setProps }) => {
  // Instead of this:
  describe("when it receives an onClick prop", () => {
    let onClick = () => {};

    beforeEach(() => {
      setProps({ onClick });
    });

    it("threads its onClick prop down to its rendered div", () => {
      const div = goodLuck().find("div");
      expect(div.props().onClick).toBe(onClick);
    });
  });

  // You can do this:
  describe("when it receives an onClick prop", () => {
    beforeEach(() => {
      setProps({ onClick: () => {} });
    });

    it("threads its onClick prop down to its rendered div", () => {
      const div = goodLuck().find("div");
      expect(div.props().onClick).toBe(props().onClick);
    });
  });
});
```

## Usage (Test Runner Configuration)

### Jest
```js
import describeComponent from "describe-component/jest";
import MyComponent from "./MyComponent";

describeComponent(MyComponent, ({
  // It's common to use only one of mountWrapper, shallowWrapper, or
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

See also the [Jest example](https://github.com/suchipi/describe-component/tree/master/examples/jest).

### Mocha
```js
import describeComponent from "describe-component/mocha";
import MyComponent from "./MyComponent";

describeComponent(MyComponent, ({
  // It's common to use only one of mountWrapper, shallowWrapper, or
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

See also the [Mocha example](https://github.com/suchipi/describe-component/tree/master/examples/mocha).

### Jasmine
```js
import describeComponent from "describe-component/jasmine";
import MyComponent from "./MyComponent";

describeComponent(MyComponent, ({
  // It's common to use only one of mountWrapper, shallowWrapper, or
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

See also the [Jasmine example](https://github.com/suchipi/describe-component/tree/master/examples/jasmine).

### AVA
```js
import test from "ava";
import MyComponent from "./MyComponent";

const describeComponent = require("describe-component/ava")(test);

describeComponent(MyComponent, ({
  // It's common to use only one of mountWrapper, shallowWrapper, or
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

See also the [AVA example](https://github.com/suchipi/describe-component/tree/master/examples/ava).

### Generic/Other
```js
// If your test runner isn't listed or supported yet, you can configure
// describe-component manually to work with it as long as it has support for
// beforeEach/afterEach hooks.
import makeDescribeComponent from "describe-component";
import MyComponent from "./MyComponent";

const describeComponent = makeDescribeComponent({
  // A function that works like jest/jasmine/mocha's `describe`; that is, it
  // declares a "context" about what you're testing. describeComponent will only
  // call it once (passing in the component's name).
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

See also the [way it was done for AVA](https://github.com/suchipi/describe-component/blob/master/ava.js).

## License

MIT
