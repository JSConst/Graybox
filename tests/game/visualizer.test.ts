import { ReturnPointer } from "../../src/script/lang/rPointer";
import { Variable } from "../../src/script/lang/variable";
import { Visualizer } from "../../src/script/game/visualizer";

const rightRamState1 =
  " 00   00   00   00   00   00   00   00   00   00   00   00   00   00   00   00  ";
const rightRamState2 =
  " 01   00   00   00   00   00   00   00   00   00   00   00   00   00   ff   ff  ";
const rightScreenState1 = "a\nb\nc";
const rightScreenState2 = "b\nc\n";
const iHistFromJS = `JS Code Start
(() => {let result = [];
let c = 3;
result.push(c);
for (let i = 0; i < c; i ++)
{
  result.push(i);
}
return result;
})();
JS code END`;

const errIHistFromJS = `JS Code Start
};
JS code END`;

describe("tests Visualizer class", () => {
  beforeEach(() => {
    document.body.innerHTML =
      "<textarea id='console'></textarea><textarea id='code'></textarea><div id='input'></div>";
  });

  it("tests that Visualizer is a class", () => {
    expect(Visualizer).toBeDefined();
    expect(new Visualizer()).toBeInstanceOf(Visualizer);
  });

  it("test that Visualizer class can to show need textarea element", () => {
    const v = new Visualizer();
    v.showNeedTextArea(["console", "code"], 0);
    expect(
      (document.getElementById("console") as HTMLTextAreaElement).style[
        "display"
      ]
    ).toEqual("block");
    expect(
      (document.getElementById("code") as HTMLTextAreaElement).style["display"]
    ).toEqual("none");

    v.showNeedTextArea(["console", "code"], 1);
    expect(
      (document.getElementById("console") as HTMLTextAreaElement).style[
        "display"
      ]
    ).toEqual("none");
    expect(
      (document.getElementById("code") as HTMLTextAreaElement).style["display"]
    ).toEqual("block");
  });

  it("tests that Visualizer class can to show RAM state", () => {
    const v = new Visualizer();
    let ramState = v.showRam(null, {}, {}, 16, 0, 1);
    expect(ramState).toEqual(rightRamState1);
    ramState = v.showRam(
      null,
      { "0": new Variable("A", 1, 0, 0, 1) },
      { "0": new ReturnPointer("65535", 14, 2) },
      16,
      0,
      1
    );
    expect(ramState).toEqual(rightRamState2);
  });

  it("tests that Visualizer class can to show  Screen state", () => {
    const v = new Visualizer();
    let screenState = v.showScreen(
      null,
      { "0": "A", "1": "B", "2": "C" },
      3,
      5
    );
    expect(screenState.match(rightScreenState1)).not.toBeNull();
    screenState = v.showScreen(null, { "0": "A", "1": "B", "2": "C" }, 3, 2);
    expect(screenState.match(rightScreenState2)).not.toBeNull();
  });

  it("tests that Visualizer class can return the input history", () => {
    const v = new Visualizer();
    let iHist = v.getInputHistory(null, '1\n"123"');
    expect(iHist.getNextInputValue()).toEqual("1");
    expect(iHist.getNextInputValue()).toEqual('"123"');
    expect(iHist.getNextInputValue()).toBeNull();

    iHist = v.getInputHistory(null, iHistFromJS);
    expect(iHist.getNextInputValue()).toEqual("3");
    expect(iHist.getNextInputValue()).toEqual("0");
    expect(iHist.getNextInputValue()).toEqual("1");
    expect(iHist.getNextInputValue()).toEqual("2");
    expect(iHist.getNextInputValue()).toBeNull();

    iHist = v.getInputHistory(null, "2 * 2 + 3");
    expect(iHist.getNextInputValue()).toEqual("7");
    expect(iHist.getNextInputValue()).toBeNull();

    let errMsg = "";
    try {
      iHist = v.getInputHistory(null, errIHistFromJS);
    } catch (e) {
      errMsg = (e as Error).toString();
    }
    expect(errMsg).toEqual("Error: INPUT DATA: BAD JS CODE STARTED AT LINE 1");
  });
});
