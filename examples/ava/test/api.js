const test = require("ava");
const React = require("react");
const PropTypes = require("prop-types");
const describeComponent = require("../../../ava")(test); // require("describe-component/ava")(test)

const ColorableDiv = ({ color, children }, { text }) => (
  <div data-component-name="ColorableDiv" style={color ? { color } : undefined}>
    {children}
    {text}
  </div>
);
ColorableDiv.contextTypes = {
  text: PropTypes.node,
};

describeComponent(ColorableDiv, ({
  mountWrapper,
  shallowWrapper,
  renderWrapper,
  setProps,
  props,
  clearProps
}) => {
  test("mountWrapper (full rendering) returns an enzyme ReactWrapper of the described component", t => {
    const { mount } = require("enzyme");
    const expectedConstructorName = mount(<ColorableDiv />).constructor.name;
    t.is(mountWrapper().constructor.name, expectedConstructorName);

    t.is(
      mountWrapper().find('[data-component-name="ColorableDiv"]').length
    , 1);
  });

  test("mountWrapper (full rendering) only renders the described component once", t => {
    t.is(mountWrapper(), mountWrapper());
  });

  test("mountWrapper (full rendering) when passing options passes them to the enzyme mount function", t => {
    const text = <span id="context-text">Hello!</span>;
    t.is(
      mountWrapper({ context: { text } }).find("#context-text").length
    , 1);
  });

  test("shallowWrapper (shallow rendering) returns an enzyme ShallowWrapper of the described component", t => {
    const { shallow } = require("enzyme");
    const expectedConstructorName = shallow(<ColorableDiv />).constructor.name;
    t.is(shallowWrapper().constructor.name, expectedConstructorName);

    t.is(
      shallowWrapper().find('[data-component-name="ColorableDiv"]').length
    , 1);
  });

  test("shallowWrapper (shallow rendering) only renders the described component once", t => {
    t.is(shallowWrapper(), shallowWrapper());
  });

  test("shallowWrapper (shallow rendering) when passing options passes them to the enzyme shallow function", t => {
    const text = <span id="context-text">Hello!</span>;
    t.is(
      shallowWrapper({ context: { text } }).find("#context-text").length
    , 1);
  });

  test("renderWrapper (static markup rendering) returns a cheerio instance of the html obtained from rendering the described component", t => {
    const { render } = require("enzyme");
    const expectedConstructorName = render(<ColorableDiv />).constructor.name;
    t.is(renderWrapper().constructor.name, expectedConstructorName);

    t.snapshot(renderWrapper().html());
  });

  test("renderWrapper (static markup rendering) is NOT memoized; it returns a new instance every time", t => {
    t.not(renderWrapper(), renderWrapper());
  });

  test("renderWrapper (static markup rendering) can be re-rendered multiple times and you can call setProps/clearProps in between", t => {
    t.snapshot(renderWrapper().html());
    setProps({ color: "red" });
    t.snapshot(renderWrapper().html());
    clearProps();
    t.snapshot(renderWrapper().html());
  });

  test("renderWrapper (static markup rendering) when passing options passes them to the enzyme render function", t => {
    const text = <span id="context-text">Hello!</span>;
    t.is(
      renderWrapper({ context: { text } }).find("#context-text").length
    , 1);
  });

  test("setProps when using mountWrapper sets the props that the coponent will be mounted with", t => {
    setProps({ color: "red" });
    const wrappingDiv = mountWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.props().style.color, "red");
  });

  test("setProps when using mountWrapper merges with existing props (similar to how React setState behaves)", t => {
    setProps({ color: "red" });
    setProps({ children: <span id="some-child" /> });

    const wrappingDiv = mountWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.props().style.color, "red");

    t.is(wrappingDiv.find("span#some-child").length, 1);
  });

  test("setProps when using mountWrapper throws an error if called after the component has been mounted", t => {
    const expectedErrorMessage = "You are trying to change props for a " +
      "ColorableDiv that has already been mounted. `setProps` is " +
      "intended to be used before mounting the component (for example, " +
      "in `beforeEach` calls). If you want an already-mounted component " +
      "to receive new props, call `setProps` on the wrapper object " +
      "returned from `mountWrapper`.";
    t.throws(() => {
      mountWrapper();
      setProps({ color: "red" });
    }, Error, expectedErrorMessage);
  });

  test("setProps when using shallowWrapper sets the props that the component will be shallow-rendered with", t => {
    setProps({ color: "red" });
    const wrappingDiv = shallowWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.props().style.color, "red");
  });

  test("setProps when using shallowWrapper merges with existing props (similar to how React setState behaves)", t => {
    setProps({ color: "red" });
    setProps({ children: <span id="some-child" /> });

    const wrappingDiv = shallowWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.props().style.color, "red");

    t.is(wrappingDiv.find("span#some-child").length, 1);
  });

  test("setProps when using shallowWrapper throws an error if called after the component has been shallow-rendered", t => {
    const expectedErrorMessage = "You are trying to change props for a " +
      "ColorableDiv that has already been shallow rendered. `setProps` is " +
      "intended to be used before shallow rendering the component (for example, " +
      "in `beforeEach` calls). If you want an already-shallow-rendered component " +
      "to receive new props, call `setProps` on the wrapper object " +
      "returned from `shallowWrapper`.";
    t.throws(() => {
      shallowWrapper();
      setProps({ color: "red" });
    }, Error, expectedErrorMessage);
  });

  test("setProps when using renderWrapper sets the props that the component will be rendered with", t => {
    setProps({ color: "red" });
    const wrappingDiv = renderWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.attr("style"), "color:red;");
  });

  test("setProps when using renderWrapper merges existing props (similar to how React setState behaves)", t => {
    setProps({ color: "red" });
    setProps({ children: <span id="some-child" /> });

    const wrappingDiv = renderWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.attr("style"), "color:red;");

    t.is(wrappingDiv.find("span#some-child").length, 1);
  });

  test("setProps when using renderWrapper does NOT throw an error if the component has already been rendered", t => {
    t.notThrows(() => {
      renderWrapper();
      setProps({ color: "red" });
    });
  });

  test("props returns the props that the component will be (or has been) rendered with", t => {
    const children = <span />;
    setProps({ color: "red" });
    setProps({ children });
    const receivedProps = props();
    t.is(receivedProps.color, "red");
    t.is(receivedProps.children, children);
  });

  test("clearProps clears the props that the component will be rendered with", t => {
    setProps({ color: "red" });
    clearProps();
    t.is(Object.keys(props()).length, 0);
  });

  test("clearProps when the component has already been rendered when using mountWrapper throws an error", t => {
    const expectedErrorMessage = "You are trying to change props for a " +
      "ColorableDiv that has already been mounted. `clearProps` is " +
      "intended to be used before mounting the component (for example, " +
      "in `beforeEach` calls). If you want an already-mounted component " +
      "to receive new props, call `setProps` on the wrapper object " +
      "returned from `mountWrapper`.";
    t.throws(() => {
      mountWrapper();
      clearProps();
    }, Error, expectedErrorMessage);
  });

  test("clearProps when the component has already been rendered when using shallowWrapper throws an error", t => {
    const expectedErrorMessage = "You are trying to change props for a " +
      "ColorableDiv that has already been shallow rendered. `clearProps` is " +
      "intended to be used before shallow rendering the component (for example, " +
      "in `beforeEach` calls). If you want an already-shallow-rendered component " +
      "to receive new props, call `setProps` on the wrapper object " +
      "returned from `shallowWrapper`.";
    t.throws(() => {
      shallowWrapper();
      clearProps();
    }, Error, expectedErrorMessage);
  });

  test("clearProps when the component has already been rendered when using renderWrapper does not throw an error", t => {
    t.notThrows(() => {
      renderWrapper();
      clearProps();
    });
  });
});
