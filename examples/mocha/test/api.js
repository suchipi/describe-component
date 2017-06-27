const React = require("react");
const expect = require("chai").expect;
const describeComponent = require("../../../mocha"); // require("describe-component/mocha")

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
      expect(mountWrapper().constructor.name).to.equal(expectedConstructorName);

      expect(
        mountWrapper().find('[data-component-name="ColorableDiv"]')
      ).to.have.length(1);
    });

    it("only renders the described component once", () => {
      expect(mountWrapper()).to.equal(mountWrapper());
    });
  });

  describe("shallowWrapper (shallow rendering)", () => {
    it("returns an enzyme ShallowWrapper of the described component", () => {
      const { shallow } = require("enzyme");
      const expectedConstructorName = shallow(<ColorableDiv />).constructor.name;
      expect(shallowWrapper().constructor.name).to.equal(expectedConstructorName);

      expect(
        shallowWrapper().find('[data-component-name="ColorableDiv"]')
      ).to.have.length(1);
    });

    it("only renders the described component once", () => {
      expect(shallowWrapper()).to.equal(shallowWrapper());
    });
  });

  describe("renderWrapper (static markup rendering)", () => {
    it("returns a cheerio instance of the html obtained from rendering the described component", () => {
      const { render } = require("enzyme");
      const expectedConstructorName = render(<ColorableDiv />).constructor.name;
      expect(renderWrapper().constructor.name).to.equal(expectedConstructorName);

      expect(renderWrapper().html()).to.equal("<div data-component-name=\"ColorableDiv\"></div>");
    });

    it("is NOT memoized; it returns a new instance every time", () => {
      expect(renderWrapper()).not.to.equal(renderWrapper());
    });

    it("can be re-rendered multiple times and you can call setProps/clearProps in between", () => {
      expect(renderWrapper().html()).to.equal("<div data-component-name=\"ColorableDiv\"></div>");
      setProps({ color: "red" });
      expect(renderWrapper().html()).to.equal("<div data-component-name=\"ColorableDiv\" style=\"color:red;\"></div>");
      clearProps();
      expect(renderWrapper().html()).to.equal("<div data-component-name=\"ColorableDiv\"></div>");
    });
  });

  describe("setProps", () => {
    describe("when using mountWrapper", () => {
      it("sets the props that the component will be mounted with", () => {
        setProps({ color: "red" });
        const wrappingDiv = mountWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.props().style.color).to.equal("red");
      });

      it("merges with existing props (similar to how React setState behaves)", () => {
        setProps({ color: "red" });
        setProps({ children: <span id="some-child" /> });

        const wrappingDiv = mountWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.props().style.color).to.equal("red");

        expect(wrappingDiv.find("span#some-child")).to.have.length(1);
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
        }).to.throw(Error, expectedErrorMessage);
      });
    });

    describe("when using shallowWrapper", () => {
      it("sets the props that the component will be shallow-rendered with", () => {
        setProps({ color: "red" });
        const wrappingDiv = shallowWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.props().style.color).to.equal("red");
      });

      it("merges with existing props (similar to how React setState behaves)", () => {
        setProps({ color: "red" });
        setProps({ children: <span id="some-child" /> });

        const wrappingDiv = shallowWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.props().style.color).to.equal("red");

        expect(wrappingDiv.find("span#some-child")).to.have.length(1);
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
        }).to.throw(Error, expectedErrorMessage);
      });
    });

    describe("when using renderWrapper", () => {
      it("sets the props that the component will be rendered with", () => {
        setProps({ color: "red" });
        const wrappingDiv = renderWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.attr("style")).to.equal("color:red;");
      });

      it("merges with existing props (similar to how React setState behaves)", () => {
        setProps({ color: "red" });
        setProps({ children: <span id="some-child" /> });

        const wrappingDiv = renderWrapper().find("[data-component-name=\"ColorableDiv\"]");
        expect(wrappingDiv.attr("style")).to.equal("color:red;");

        expect(wrappingDiv.find("span#some-child")).to.have.length(1);
      });

      it("does NOT throw an error if the component has already been rendered", () => {
        expect(() => {
          renderWrapper();
          setProps({ color: "red" });
        }).not.to.throw();
      });
    });
  });

  describe("props", () => {
    it("returns the props that the component will be (or has been) rendered with", () => {
      const children = <span />;
      setProps({ color: "red" });
      setProps({ children });
      const receivedProps = props();
      expect(receivedProps.color).to.equal("red");
      expect(receivedProps.children).to.equal(children);
    });
  });

  describe("clearProps", () => {
    it("clears the props that the component will be rendered with", () => {
      setProps({ color: "red" });
      clearProps();
      expect(Object.keys(props())).to.have.length(0);
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
          }).to.throw(Error, expectedErrorMessage);
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
          }).to.throw(Error, expectedErrorMessage);
        });
      });

      describe("when using renderWrapper", () => {
        it("does not throw an error", () => {
          expect(() => {
            renderWrapper();
            clearProps();
          }).not.to.throw();
        });
      });
    });
  });
});
