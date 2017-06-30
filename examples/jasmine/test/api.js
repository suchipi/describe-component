const React = require("react");
const describeComponent = require("../../../jasmine"); // require("describe-component/jasmine")

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
  describe("mountWrapper (full rendering)", () => {
    it("returns an enzyme ReactWrapper of the described component", () => {
      const { mount } = require("enzyme");
      const expectedConstructorName = mount(<ColorableDiv />).constructor.name;
      expect(mountWrapper().constructor.name).toBe(expectedConstructorName);

      expect(
        mountWrapper().find('[data-component-name="ColorableDiv"]').length
      ).toBe(1);
    });

    it("only renders the described component once", () => {
      expect(mountWrapper()).toBe(mountWrapper());
    });
  });

  describe("shallowWrapper (shallow rendering)", () => {
    it("returns an enzyme ShallowWrapper of the described component", () => {
      const { shallow } = require("enzyme");
      const expectedConstructorName = shallow(<ColorableDiv />).constructor.name;
      expect(shallowWrapper().constructor.name).toBe(expectedConstructorName);

      expect(
        shallowWrapper().find('[data-component-name="ColorableDiv"]').length
      ).toEqual(1);
    });

    it("only renders the described component once", () => {
      expect(shallowWrapper()).toBe(shallowWrapper());
    });
  });

  describe("renderWrapper (static markup rendering)", () => {
    it("returns a cheerio instance of the html obtained from rendering the described component", () => {
      const { render } = require("enzyme");
      const expectedConstructorName = render(<ColorableDiv />).constructor.name;
      expect(renderWrapper().constructor.name).toBe(expectedConstructorName);

      expect(renderWrapper().html()).toBe("<div data-component-name=\"ColorableDiv\"></div>");
    });

    it("is NOT memoized; it returns a new instance every time", () => {
      expect(renderWrapper()).not.toBe(renderWrapper());
    });

    it("can be re-rendered multiple times and you can call setProps/clearProps in between", () => {
      expect(renderWrapper().html()).toBe("<div data-component-name=\"ColorableDiv\"></div>");
      setProps({ color: "red" });
      expect(renderWrapper().html()).toBe("<div data-component-name=\"ColorableDiv\" style=\"color:red;\"></div>");
      clearProps();
      expect(renderWrapper().html()).toBe("<div data-component-name=\"ColorableDiv\"></div>");
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

        expect(wrappingDiv.find("span#some-child").length).toBe(1);
      });

      it("throws an error if called after the component has been mounted", () => {
        const expectedErrorMessage = "You are trying to change props for a " +
          "ColorableDiv that has already been mounted. `setProps` is " +
          "intended to be used before mounting the component (for example, " +
          "in `beforeEach` calls). If you want an already-mounted component " +
          "to receive new props, call `setProps` on the wrapper object " +
          "returned from `mountWrapper`.";
        expect(() => {
          mountWrapper();
          setProps({ color: "red" });
        }).toThrow(new Error(expectedErrorMessage));
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

        expect(wrappingDiv.find("span#some-child").length).toBe(1);
      });

      it("throws an error if called after the component has been shallow-rendered", () => {
        const expectedErrorMessage = "You are trying to change props for a " +
          "ColorableDiv that has already been shallow rendered. `setProps` is " +
          "intended to be used before shallow rendering the component (for example, " +
          "in `beforeEach` calls). If you want an already-shallow-rendered component " +
          "to receive new props, call `setProps` on the wrapper object " +
          "returned from `shallowWrapper`.";
        expect(() => {
          shallowWrapper();
          setProps({ color: "red" });
        }).toThrow(new Error(expectedErrorMessage));
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

        expect(wrappingDiv.find("span#some-child").length).toBe(1);
      });

      it("does NOT throw an error if the component has already been rendered", () => {
        expect(() => {
          renderWrapper();
          setProps({ color: "red" });
        }).not.toThrow();
      });
    });
  });

  describe("props", () => {
    it("returns the props that the component will be (or has been) rendered with", () => {
      const children = <span />;
      setProps({ color: "red" });
      setProps({ children });
      const receivedProps = props();
      expect(receivedProps.color).toBe("red");
      expect(receivedProps.children).toBe(children);
    });
  });

  describe("clearProps", () => {
    it("clears the props that the component will be rendered with", () => {
      setProps({ color: "red" });
      clearProps();
      expect(Object.keys(props()).length).toBe(0);
    });

    describe("when the component has already been rendered", () => {
      describe("when using mountWrapper", () => {
        it("throws an error", () => {
          const expectedErrorMessage = "You are trying to change props for a " +
            "ColorableDiv that has already been mounted. `clearProps` is " +
            "intended to be used before mounting the component (for example, " +
            "in `beforeEach` calls). If you want an already-mounted component " +
            "to receive new props, call `setProps` on the wrapper object " +
            "returned from `mountWrapper`.";
          expect(() => {
            mountWrapper();
            clearProps();
          }).toThrow(new Error(expectedErrorMessage));
        });
      });

      describe("when using shallowWrapper", () => {
        it("throws an error", () => {
          const expectedErrorMessage = "You are trying to change props for a " +
            "ColorableDiv that has already been shallow rendered. `clearProps` is " +
            "intended to be used before shallow rendering the component (for example, " +
            "in `beforeEach` calls). If you want an already-shallow-rendered component " +
            "to receive new props, call `setProps` on the wrapper object " +
            "returned from `shallowWrapper`.";
          expect(() => {
            shallowWrapper();
            clearProps();
          }).toThrow(new Error(expectedErrorMessage));
        });
      });

      describe("when using renderWrapper", () => {
        it("does not throw an error", () => {
          expect(() => {
            renderWrapper();
            clearProps();
          }).not.toThrow();
        });
      });
    });
  });
});
