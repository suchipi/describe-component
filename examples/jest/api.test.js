const React = require("react");
const PropTypes = require("prop-types");
const describeComponent = require("../../jest"); // require("describe-component/jest")

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
  describe("mountWrapper (full rendering)", () => {
    it("returns an enzyme ReactWrapper of the described component", () => {
      const { mount } = require("enzyme");
      const expectedConstructorName = mount(<ColorableDiv />).constructor.name;
      expect(mountWrapper().constructor.name).toBe(expectedConstructorName);

      expect(
        mountWrapper().find('[data-component-name="ColorableDiv"]')
      ).toHaveLength(1);
    });

    it("only renders the described component once", () => {
      expect(mountWrapper()).toBe(mountWrapper());
    });

    describe("when passing options", () => {
      it("passes them to the enzyme mount function", () => {
        const text = <span id="context-text">Hello!</span>;
        expect(mountWrapper({ context: { text } }).find("#context-text")).toHaveLength(1);
      });
    });
  });

  describe("shallowWrapper (shallow rendering)", () => {
    it("returns an enzyme ShallowWrapper of the described component", () => {
      const { shallow } = require("enzyme");
      const expectedConstructorName = shallow(<ColorableDiv />).constructor.name;
      expect(shallowWrapper().constructor.name).toBe(expectedConstructorName);

      expect(
        shallowWrapper().find('[data-component-name="ColorableDiv"]')
      ).toHaveLength(1);
    });

    it("only renders the described component once", () => {
      expect(shallowWrapper()).toBe(shallowWrapper());
    });

    describe("when passing options", () => {
      it("passes them to the enzyme shallow function", () => {
        const text = <span id="context-text">Hello!</span>;
        expect(shallowWrapper({ context: { text } }).find("#context-text")).toHaveLength(1);
      });
    });
  });

  describe("renderWrapper (static markup rendering)", () => {
    it("returns a cheerio instance of the html obtained from rendering the described component", () => {
      const { render } = require("enzyme");
      const expectedConstructorName = render(<ColorableDiv />).constructor.name;
      expect(renderWrapper().constructor.name).toBe(expectedConstructorName);

      expect(renderWrapper().html()).toMatchSnapshot();
    });

    it("is NOT memoized; it returns a new instance every time", () => {
      expect(renderWrapper()).not.toBe(renderWrapper());
    });

    it("can be re-rendered multiple times and you can call setProps/clearProps in between", () => {
      expect(renderWrapper().html()).toMatchSnapshot();
      setProps({ color: "red" });
      expect(renderWrapper().html()).toMatchSnapshot();
      clearProps();
      expect(renderWrapper().html()).toMatchSnapshot();
    });

    describe("when passing options", () => {
      it("passes them to the enzyme render function", () => {
        const text = <span id="context-text">Hello!</span>;
        expect(renderWrapper({ context: { text } }).find("#context-text")).toHaveLength(1);
      });
    });
  });

  describe("setProps", () => {
    describe("when using mountWrapper", () => {
      it("sets the props that the component will be mounted with", () => {
        setProps({ color: "red" });
        const wrappingDiv = mountWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.props().style.color).toBe("red");
      });

      it("merges with existing props (similar to how React setState behaves)", () => {
        setProps({ color: "red" });
        setProps({ children: <span id="some-child" /> });

        const wrappingDiv = mountWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.props().style.color).toBe("red");

        expect(wrappingDiv.find("span#some-child")).toHaveLength(1);
      });

      it("throws an error if called after the component has been mounted", () => {
        expect(() => {
          mountWrapper();
          setProps({ color: "red" });
        }).toThrowErrorMatchingSnapshot();
      });
    });

    describe("when using shallowWrapper", () => {
      it("sets the props that the component will be shallow-rendered with", () => {
        setProps({ color: "red" });
        const wrappingDiv = shallowWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.props().style.color).toBe("red");
      });

      it("merges with existing props (similar to how React setState behaves)", () => {
        setProps({ color: "red" });
        setProps({ children: <span id="some-child" /> });

        const wrappingDiv = shallowWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.props().style.color).toBe("red");

        expect(wrappingDiv.find("span#some-child")).toHaveLength(1);
      });

      it("throws an error if called after the component has been shallow-rendered", () => {
        expect(() => {
          shallowWrapper();
          setProps({ color: "red" });
        }).toThrowErrorMatchingSnapshot();
      });
    });

    describe("when using renderWrapper", () => {
      it("sets the props that the component will be rendered with", () => {
        setProps({ color: "red" });
        const wrappingDiv = renderWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.attr("style")).toBe("color:red;");
      });

      it("merges with existing props (similar to how React setState behaves)", () => {
        setProps({ color: "red" });
        setProps({ children: <span id="some-child" /> });

        const wrappingDiv = renderWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.attr("style")).toBe("color:red;");

        expect(wrappingDiv.find("span#some-child")).toHaveLength(1);
      });

      it("does NOT throw an error if the component has already been rendered", () => {
        expect(() => {
          renderWrapper();
          setProps({ color: "red" });
        }).not.toThrowError();
      });
    });
  });

  describe("props", () => {
    it("returns the props that the component will be (or has been) rendered with", () => {
      const children = <span />;
      setProps({ color: "red" });
      setProps({ children });
      expect(props()).toMatchObject({
        color: "red",
        children,
      });
    });
  });

  describe("clearProps", () => {
    it("clears the props that the component will be rendered with", () => {
      setProps({ color: "red" });
      clearProps();
      expect(Object.keys(props())).toHaveLength(0);
    });

    describe("when the component has already been rendered", () => {
      describe("when using mountWrapper", () => {
        it("throws an error", () => {
          expect(() => {
            mountWrapper();
            clearProps();
          }).toThrowErrorMatchingSnapshot();
        });
      });

      describe("when using shallowWrapper", () => {
        it("throws an error", () => {
          expect(() => {
            shallowWrapper();
            clearProps();
          }).toThrowErrorMatchingSnapshot();
        });
      });

      describe("when using renderWrapper", () => {
        it("does not throw an error", () => {
          expect(() => {
            renderWrapper();
            clearProps();
          }).not.toThrowError();
        });
      });
    });
  });
});
