import { Executor } from "../../src/script/lang/executor";
import { Environment } from "../../src/script/lang/environment";
import { InputHistory } from "../../src/script/lang/iHistory";
import { Parser } from "../../src/script/lang/parser";

describe("tests of Executor class", () => {
  it("tests that Executor is a right class", () => {
    expect(Executor).toBeDefined();
    expect(new Executor()).toBeInstanceOf(Executor);
  });

  it("tests that Executor is calculating string expressions", () => {
    const exec = new Executor();
    const parser = new Parser();

    const env = new Environment(
      256,
      256,
      ['10 LET A$ = "789"'],
      new InputHistory()
    );
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    let eRslt = exec.calcExpression('"123" + ("456" + A$)', 0, 1, env);
    expect(eRslt.type).toEqual(1);
    expect(eRslt.rslt).toEqual("123456789");

    eRslt = exec.calcExpression('"123" + ("456" + A$)', 0, 0, env);
    expect(eRslt.type).toEqual(1);
    expect(eRslt.rslt).toEqual("12345678");
  });

  it("tests that Executor is calculating numeric expressions", () => {
    const exec = new Executor();
    const parser = new Parser();

    let env = new Environment(256, 256, ["10 LET A = 128"], new InputHistory());
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    let eRslt = exec.calcExpression("(123 + (456 + A)) / 2", 0, 0, env);
    expect(eRslt.type).toEqual(0);
    expect(eRslt.rslt).toEqual(225);

    env = new Environment(256, 256, ["10 LET A = 1"], new InputHistory());
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    eRslt = exec.calcExpression("(NOT (2 XOR A)) AND 4", 0, 0, env);
    expect(eRslt.type).toEqual(0);
    expect(eRslt.rslt).toEqual(4);

    env = new Environment(256, 256, ["10 LET A = 1"], new InputHistory());
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    eRslt = exec.calcExpression("(2 OR A) AND (NOT 1)", 0, 0, env);
    expect(eRslt.type).toEqual(0);
    expect(eRslt.rslt).toEqual(2);
  });

  it("tests that Executor is allow hexadecimal values", () => {
    const exec = new Executor();
    const parser = new Parser();

    const env = new Environment(
      256,
      256,
      ["10 LET A = &H80"],
      new InputHistory()
    );
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    const eRslt = exec.calcExpression("(123 + (456 + A)) / 2", 0, 0, env);
    expect(eRslt.type).toEqual(0);
    expect(eRslt.rslt).toEqual(225);
  });

  it("tests that Executor is calculating boolean expressions", () => {
    const exec = new Executor();
    const parser = new Parser();

    let env = new Environment(256, 256, ["10 LET A = 1"], new InputHistory());
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    let eRslt = exec.calcExpression("A = 1", 1, 0, env);
    expect(eRslt.type).toEqual(2);
    expect(eRslt.rslt).toEqual(true);

    env = new Environment(256, 256, ["10 LET A = 128"], new InputHistory());
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    eRslt = exec.calcExpression("A <> 0", 1, 0, env);
    expect(eRslt.type).toEqual(2);
    expect(eRslt.rslt).toEqual(true);

    env = new Environment(256, 256, ["10 LET A = 1"], new InputHistory());
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    eRslt = exec.calcExpression(
      "NOT (((A = 0) AND (A = 10)) OR (A <> 0))",
      1,
      0,
      env
    );
    expect(eRslt.type).toEqual(2);
    expect(eRslt.rslt).toEqual(false);

    env = new Environment(256, 256, ["10 LET A = 1"], new InputHistory());
    exec.execute(parser.parse(env.getCurrentProgramLine(), env), env);
    eRslt = exec.calcExpression("(A = 1) XOR (A = 10)", 1, 0, env);
    expect(eRslt.type).toEqual(2);
    expect(eRslt.rslt).toEqual(true);
  });
});
