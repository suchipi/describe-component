const React = require("react");
const expect = require("chai").expect;
const describeComponent = require("../../../mocha"); // require("describe-component/mocha")

const ColorableDiv = ({ color, children }) => (
  <div data-component-name="ColorableDiv" style={color ? { color } : undefined}>
    {children}
  </div>
);

describeComponent(ColorableDiv, ({ mountWrapper: colorableDiv, setProps }) => {
  it("renders a div", () => {
    expect(colorableDiv().find("div")).to.have.length(1);
  });

  it("sets the data-component-name attribute on that div to 'ColorableDiv'", () => {
    const divProps = colorableDiv().find("div").props();
    expect(divProps["data-component-name"]).to.equal("ColorableDiv");
  });

  describe("with children", () => {
    beforeEach(() => {
      setProps({ children: <span id="some-child" /> });
    });

    it("passes its children to the div", () => {
      expect(colorableDiv().find("#some-child")).to.have.length(1);
    });
  });

  describe("with a color", () => {
    beforeEach(() => {
      setProps({ color: "red" });
    });

    it("sets the inline style of the div", () => {
      const style = colorableDiv().find("div").props().style;
      expect(style).to.be.an("object");
      expect(style.color).to.equal("red");
    });
  });

  describe("with no color", () => {
    it("sets no inline styles", () => {
      const style = colorableDiv().find("div").props().style;
      expect(style).to.be.undefined;
    });
  });
});
