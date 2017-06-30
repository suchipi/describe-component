const test = require("ava");
const React = require("react");
const describeComponent = require("../../../ava")(test); // require("describe-component/ava")(test)

const ColorableDiv = ({ color, children }) => (
  <div data-component-name="ColorableDiv" style={color ? { color } : undefined}>
    {children}
  </div>
);

describeComponent(ColorableDiv, ({
  mountWrapper,
  shallowWrapper,
  renderWrapper,
  setProps,
  props,
  clearProps
}) => {
  test("mountWrapper (full rendering) returns an enzyme ReactWrapper of the described component", t => {
    t.plan(2);

    const { mount } = require("enzyme");
    const expectedConstructorName = mount(<ColorableDiv />).constructor.name;
    t.is(mountWrapper().constructor.name, expectedConstructorName);

    t.is(
      mountWrapper().find('[data-component-name="ColorableDiv"]').length
    , 1);
  });

  test("mountWrapper (full rendering) only renders the described component once", t => {
    t.plan(1);

    t.is(mountWrapper(), mountWrapper());
  });

  test("shallowWrapper (shallow rendering) returns an enzyme ShallowWrapper of the described component", t => {
    t.plan(2);

    const { shallow } = require("enzyme");
    const expectedConstructorName = shallow(<ColorableDiv />).constructor.name;
    t.is(shallowWrapper().constructor.name, expectedConstructorName);

    t.is(
      shallowWrapper().find('[data-component-name="ColorableDiv"]').length
    , 1);
  });

  test("shallowWrapper (shallow rendering) only renders the described component once", t => {
    t.plan(1);

    t.is(shallowWrapper(), shallowWrapper());
  });

  test("renderWrapper (static markup rendering) returns a cheerio instance of the html obtained from rendering the described component", t => {
    t.plan(2);

    const { render } = require("enzyme");
    const expectedConstructorName = render(<ColorableDiv />).constructor.name;
    t.is(renderWrapper().constructor.name, expectedConstructorName);

    t.snapshot(renderWrapper().html());
  });

  test("renderWrapper (static markup rendering) is NOT memoized; it returns a new instance every time", t => {
    t.plan(1);

    t.not(renderWrapper(), renderWrapper());
  });

  test("renderWrapper (static markup rendering) can be re-rendered multiple times and you can call setProps/clearProps in between", t => {
    t.plan(3);

    t.snapshot(renderWrapper().html());
    setProps({ color: "red" });
    t.snapshot(renderWrapper().html());
    clearProps();
    t.snapshot(renderWrapper().html());
  });

  test("setProps when using mountWrapper sets the props that the coponent will be mounted with", t => {
    t.plan(1);

    setProps({ color: "red" });
    const wrappingDiv = mountWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.props().style.color, "red");
  });

  test("setProps when using mountWrapper merges with existing props (similar to how React setState behaves)", t => {
    t.plan(2);

    setProps({ color: "red" });
    setProps({ children: <span id="some-child" /> });

    const wrappingDiv = mountWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.props().style.color, "red");

    t.is(wrappingDiv.find("span#some-child").length, 1);
  });

  test("setProps when using mountWrapper throws an error if called after the component has been mounted", t => {
    t.plan(1);

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
    t.plan(1);

    setProps({ color: "red" });
    const wrappingDiv = shallowWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.props().style.color, "red");
  });

  test("setProps when using shallowWrapper merges with existing props (similar to how React setState behaves)", t => {
    t.plan(2);

    setProps({ color: "red" });
    setProps({ children: <span id="some-child" /> });

    const wrappingDiv = shallowWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.props().style.color, "red");

    t.is(wrappingDiv.find("span#some-child").length, 1);
  });

  test("setProps when using shallowWrapper throws an error if called after the component has been shallow-rendered", t => {
    t.plan(1);

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
    t.plan(1);

    setProps({ color: "red" });
    const wrappingDiv = renderWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.attr("style"), "color:red;");
  });

  test("setProps when using renderWrapper merges existing props (similar to how React setState behaves)", t => {
    t.plan(2);

    setProps({ color: "red" });
    setProps({ children: <span id="some-child" /> });

    const wrappingDiv = renderWrapper().find("[data-component-name=\"ColorableDiv\"]");
    t.is(wrappingDiv.attr("style"), "color:red;");

    t.is(wrappingDiv.find("span#some-child").length, 1);
  });

  test("setProps when using renderWrapper does NOT throw an error if the component has already been rendered", t => {
    t.plan(1);

    t.notThrows(() => {
      renderWrapper();
      setProps({ color: "red" });
    });
  });

  test("props returns the props that the component will be (or has been) rendered with", t => {
    t.plan(2);

    const children = <span />;
    setProps({ color: "red" });
    setProps({ children });
    const receivedProps = props();
    t.is(receivedProps.color, "red");
    t.is(receivedProps.children, children);
  });

  test("clearProps clears the props that the component will be rendered with", t => {
    t.plan(1);

    setProps({ color: "red" });
    clearProps();
    t.is(Object.keys(props()).length, 0);
  });

  test("clearProps when the component has already been rendered when using mountWrapper throws an error", t => {
    t.plan(1);

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
    t.plan(1);

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
    t.plan(1);

    t.notThrows(() => {
      renderWrapper();
      clearProps();
    });
  });
});
