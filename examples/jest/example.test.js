const React = require("react");
const describeComponent = require("../../jest"); //require("describe-component/jest")

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
