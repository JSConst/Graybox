import { Command } from "../../src/script/lang/command";

describe("test of Command class", () => {
  it("tests that Command is a class", () => {
    expect(Command).toBeDefined();
    expect(new Command("TEST", "operand", "expression")).toBeInstanceOf(
      Command
    );
  });

  it("tests that Command getters and setters do all right", () => {
    const c = new Command("TEST", "operand", "expression");
    expect(c.name).toEqual("TEST");
    expect(c.operand).toEqual("operand");
    expect(c.expression).toEqual("expression");

    c.name = "TEST1";
    c.operand = "operand1";
    c.expression = "expression1";

    expect(c.name).toEqual("TEST1");
    expect(c.operand).toEqual("operand1");
    expect(c.expression).toEqual("expression1");
  });
});
