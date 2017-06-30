const React = require("react");
const describeComponent = require("../../../jasmine"); // require("describe-component/jasmine")

const ColorableDiv = ({ color, children }) => (
  <div data-component-name="ColorableDiv" style={color ? { color } : undefined}>
    {children}
  </div>
);

describeComponent(ColorableDiv, ({ mountWrapper: colorableDiv, setProps }) => {
  it("renders a div", () => {
    expect(colorableDiv().find("div").length).toBe(1);
  });

  it("sets the data-component-name attribute on that div to 'ColorableDiv'", () => {
    const divProps = colorableDiv().find("div").props();
    expect(divProps["data-component-name"]).toBe("ColorableDiv");
  });

  describe("with children", () => {
    beforeEach(() => {
      setProps({ children: <span id="some-child" /> });
    });

    it("passes its children to the div", () => {
      expect(colorableDiv().find("#some-child").length).toBe(1);
    });
  });

  describe("with a color", () => {
    beforeEach(() => {
      setProps({ color: "red" });
    });

    it("sets the inline style of the div", () => {
      const style = colorableDiv().find("div").props().style;
      expect(typeof style).toBe("object");
      expect(style.color).toBe("red");
    });
  });

  describe("with no color", () => {
    it("sets no inline styles", () => {
      const style = colorableDiv().find("div").props().style;
      expect(style).toBeUndefined();
    });
  });
});
