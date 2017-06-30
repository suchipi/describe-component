const test = require("ava");
const React = require("react");
const describeComponent = require("../../../ava")(test); // require("describe-component/ava")(test)

const ColorableDiv = ({ color, children }) => (
  <div data-component-name="ColorableDiv" style={color ? { color } : undefined}>
    {children}
  </div>
);

describeComponent(ColorableDiv, ({ mountWrapper: colorableDiv, setProps }) => {
  test("ColorableDiv renders a div", t => {
    t.is(colorableDiv().find("div").length, 1);
  });

  test("ColorableDiv sets the data-component-name attribute on that div to 'ColorableDiv'", t => {
    const divProps = colorableDiv().find("div").props();
    t.is(divProps["data-component-name"], "ColorableDiv");
  });

  test("ColorableDiv with children passes its children to the div", t => {
    setProps({ children: <span id="some-child" /> });
    t.is(colorableDiv().find("#some-child").length, 1);
  });

  test("ColorableDiv with a color sets the inline style of the div", t => {
    setProps({ color: "red" });
    const style = colorableDiv().find("div").props().style;

    t.is(typeof style, "object");
    t.is(style.color, "red");
  });

  test("ColorableDiv with no color sets no inline styles", t => {
    const style = colorableDiv().find("div").props().style;
    t.is(style, undefined);
  });
});
