import { Visualizer } from "../../src/script/game/visualizer";
import { Comparer } from "../../src/script/game/comparer";

const errMessage1 = `COMPARED PROGRAMS ARE NOT IDENTICAL BY RAM CHECK:
FINALLY STATES OF RAM DID NOT MATCH`;
const errMessage2 = `COMPARED PROGRAMS ARE NOT IDENTICAL BY SCREEN CHECK:
DID NOT MATCH ON THE SCREEN LINE 1`;
const errMessage3 = "Error: ERROR IN LINE 0: VARIABLE A MUST BE DEFINED FIRST";
const errMessage4 = "Error: ERROR IN LINE 10: INPUT VALUES LIST IS EMPTY NOW";

describe("tests Comparer class", () => {
  beforeEach(() => {
    document.body.innerHTML = "<textarea id='console'></textarea>";
  });

  it("tests that class exists", () => {
    expect(Comparer).toBeDefined();
    expect(new Comparer([0, 0, 0, 0, 0, 0])).toBeInstanceOf(Comparer);
  });

  it("tests that Comparer is comparing programs that are equals", () => {
    expect(
      new Comparer([0, 0, 0, 0, 0, 0]).compare(
        "0 REM TEST1",
        "0 REM TEST2",
        "",
        "console",
        new Visualizer()
      )
    ).toEqual(1);
  });

  it("tests that Comparer is comparing programs that are not the same by RAM", () => {
    expect(
      new Comparer([0, 0, 0, 0, 0, 0]).compare(
        "0 REM TEST1",
        "0 LET A = 10",
        "",
        "console",
        new Visualizer()
      )
    ).toEqual(0);
    expect(
      (document.getElementById("console") as HTMLTextAreaElement).value
    ).toEqual(errMessage1);
  });

  it("tests that Comparer is comparing programs that are not the same by screen", () => {
    expect(
      new Comparer([0, 0, 0, 0, 0, 0]).compare(
        "0 REM TEST1",
        '0 PRINT "123"',
        "",
        "console",
        new Visualizer()
      )
    ).toEqual(0);
    expect(
      (document.getElementById("console") as HTMLTextAreaElement).value
    ).toEqual(errMessage2);
  });

  it("tests that Comparer is not compare without need input history", () => {
    let msg = "";
    try {
      new Comparer([0, 0, 0, 0, 0, 0]).compare(
        "0 LET A = 10\n10 INPUT A",
        "0 LET A\n10 INPUT A",
        "",
        "console",
        new Visualizer()
      );
    } catch (e) {
      msg = (e as Error).toString();
    }
    expect(msg).toEqual(errMessage4);
  });

  it("tests that Comparer is not comparing wrong programs", () => {
    let msg = "";
    try {
      new Comparer([0, 0, 0, 0, 0, 0]).compare(
        "0 A = 10",
        "0 A = 20",
        "",
        "console",
        new Visualizer()
      );
    } catch (e) {
      msg = (e as Error).toString();
    }
    expect(msg).toEqual(errMessage3);
  });
});
