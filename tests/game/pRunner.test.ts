import * as msg from "../../src/script/consts/messages";
import * as cnst from "../../src/script/consts/const";

import { ProgramRunner } from "../../src/script/game/pRunner";
import { Environment } from "../../src/script/lang/environment";

describe("test ProgramRunner class", () => {
  beforeEach(() => {
    document.body.innerHTML = "<textarea id='console'></textarea>";
  });

  it("tests that ProgramRunner it is the class", () => {
    expect(ProgramRunner).toBeDefined();
    expect(
      new ProgramRunner("0 LET A = 1\n10 A = 2", null, "console")
    ).toBeInstanceOf(ProgramRunner);
  });

  it("tests that instance of ProgramRunner class do all right", () => {
    let pr = new ProgramRunner("0 LET A = 1\n10 A = 2", null, "console");
    let errMsg = "";
    try {
      pr.run();
    } catch (e) {
      errMsg = (e as Error).toString();
    }
    expect(errMsg).toEqual(
      `Error: ${msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)}`
    );

    errMsg = "";
    pr = new ProgramRunner("0 REM TEST\n10 GOTO 0", null, "console");
    try {
      pr.run();
    } catch (e) {
      errMsg = (e as Error).toString();
    }
    expect(errMsg).toEqual(
      `Error: ${msg.makeMsg(msg.MESSAGES.EXE_LOOPING_MSG, cnst.MAX_STEP_COUNT)}`
    );

    errMsg = "";
    pr = new ProgramRunner("0 REM TEST\n10 GOTO 0", null, "console");
    try {
      pr.step();
    } catch (e) {
      errMsg = (e as Error).toString();
    }
    expect(
      (document.getElementById("console") as HTMLTextAreaElement).value.match(
        "0 rem test"
      )
    ).not.toBeNull();
    expect(
      (document.getElementById("console") as HTMLTextAreaElement).style["color"]
    ).toEqual("green");

    errMsg = "";
    pr = new ProgramRunner("0 REM TEST", null, "console");
    try {
      pr.step();
      pr.step();
    } catch (e) {
      errMsg = (e as Error).toString();
    }
    expect(errMsg).toEqual(
      `Error: ${msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)}`
    );

    expect(pr.env).toBeInstanceOf(Environment);
  });
});
