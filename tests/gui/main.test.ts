import * as msg from "../../src/script/consts/messages";
import * as cnst from "../../src/script/consts/const";
import * as id from "../../src/script/consts/id";
import * as classes from "../../src/script/consts/class";

import { GUI } from "../../src/script/gui/main";
import { TaskList } from "../../src/script/game/taskList";

const tasks: TaskList = {
  text: [
    {
      name: "TEST PROG",
      codeHint:
        '0 PRINTLN "TEST"\n1 LET A\n2 A = 10 - 3 + 3\n3 LET B$ = "10"\n4 INPUT B$\n5 LET C\n6 GOSUB 8\n7 GOTO 9\n8 IF (A = 10) THEN RETURN\n9 IF (B$ = "123") THEN PRINT B ELSE PRINT A\n10 DIM G$(3)\n11 G$(0) = "A"\n12 DIM F(4)\n13 F(3) = 1\n14 END',
      testProg:
        '0 PRINTLN "TEST"\n1 LET A\n2 A = 10 - 5 + 5\n3 LET B$ = "10"\n4 INPUT B$\n5 LET C\n6 GOSUB 8\n7 GOTO 9\n8 IF (A = 10) THEN RETURN\n9 IF (B$ = "123") THEN PRINT B ELSE PRINT A\n10 DIM G$(3)\n11 G$(0) = "A"\n12 DIM F(4)\n13 F(3) = 1\n14 END',
      testHist: '"456"',
      checkHist: `"${Math.random().toFixed(Math.random() * 7)}"\n${
        (Math.random() * 10) >>> 0
      }`,
      storyText: "/story0.txt",
    },
    {
      name: "ALL LINES IS REMARK",
      codeHint: "0 REM",
      testProg: "0 REM\n10 LET A = 1",
      testHist: "",
      checkHist: "",
    },
  ],
  idx: 0,
};

const consoleErrMsg1 = `COMPARED PROGRAMS ARE NOT IDENTICAL BY RAM CHECK:
FINALLY STATES OF RAM DID NOT MATCH`;

const consoleErrMsg2 = "error in line 4: input values list is empty now";

const consoleMsg1 = `executed line:
0 println "test"`;

const pause = jest
  .spyOn(window.HTMLMediaElement.prototype, "pause")
  .mockImplementation(() => {});

describe("GUI tests", () => {
  beforeEach(() => {
    document.body.innerHTML = "<section></section>";
  });

  it("tests that GUI is a class", () => {
    expect(GUI).toBeDefined();
    expect(new GUI(tasks)).toBeInstanceOf(GUI);
  });

  it("tests that GUI elements are created right", () => {
    const gui = new GUI(tasks);
    gui.createIdeGui(80, 25, 18, 2, tasks.text[0].codeHint);

    expect(document.querySelectorAll("div").length).toEqual(21);
    expect(document.querySelectorAll("textarea").length).toEqual(5);
    expect(document.querySelectorAll("button").length).toEqual(19);
    expect(
      (document.getElementById(id.TA_CODE) as HTMLTextAreaElement).value
    ).toEqual(tasks.text[0].codeHint);
  });

  it("tests that check and next btn do all right", () => {
    const pause = jest
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});

    const gui = new GUI(tasks);
    gui.createIdeGui(80, 25, 18, 2, tasks.text[0].codeHint);

    (document.getElementById(id.BTN_CHECK) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TA_CONSOLE) as HTMLTextAreaElement).value
    ).toEqual(msg.makeMsg(msg.MESSAGES.UI_CONGRATULATIONS_MSG));

    (document.getElementById(id.BTN_NEXT) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TA_CODE) as HTMLTextAreaElement).value
    ).toEqual(tasks.text[1].codeHint);

    (document.getElementById(id.BTN_CHECK) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TA_CONSOLE) as HTMLTextAreaElement).value
    ).toEqual(consoleErrMsg1);

    expect(pause).toHaveBeenCalledTimes(1);
  });

  it("tests that run, step and reset btn do all right", () => {
    const gui = new GUI(tasks);
    gui.createIdeGui(80, 25, 18, 2, tasks.text[0].codeHint);

    const pause = jest
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});

    (document.getElementById(id.BTN_RUN) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TA_CONSOLE) as HTMLTextAreaElement).value
    ).toEqual(consoleErrMsg2);

    (document.getElementById(id.BTN_RST) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TA_CONSOLE) as HTMLTextAreaElement).value
    ).toEqual("");

    (document.getElementById(id.BTN_CODE) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );

    (document.getElementById(id.BTN_STEP) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TA_CONSOLE) as HTMLTextAreaElement).value
    ).toEqual(consoleMsg1);
  });

  it("tests that show btn and snapshots ctrl btns do all right", () => {
    const pause = jest
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});

    const gui = new GUI(tasks);
    gui.createIdeGui(80, 25, 18, 2, tasks.text[0].codeHint);

    expect(
      (document.getElementById(id.TASK_CONTAINER) as HTMLTextAreaElement).style[
        "display"
      ]
    ).not.toEqual("block");
    (document.getElementById(id.BTN_SHOW) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TASK_CONTAINER) as HTMLTextAreaElement).style[
        "display"
      ]
    ).toEqual("block");

    (
      document.getElementById(id.BTN_TASK_NEXT) as HTMLButtonElement
    ).dispatchEvent(new Event("click"));
    expect(
      (document.getElementById(id.TASK_LBL) as HTMLLabelElement).textContent
    ).toEqual("SNAPSHOT 2 of 3");

    (
      document.getElementById(id.BTN_TASK_PREV) as HTMLButtonElement
    ).dispatchEvent(new Event("click"));
    expect(
      (document.getElementById(id.TASK_LBL) as HTMLLabelElement).textContent
    ).toEqual("SNAPSHOT 1 of 3");

    (
      document.getElementById(id.BTN_TASK_PLAY_NEXT) as HTMLButtonElement
    ).dispatchEvent(new Event("click"));
    expect(
      (document.getElementById(id.TASK_LBL) as HTMLLabelElement).textContent
    ).toEqual("SNAPSHOT 3 of 3");

    (
      document.getElementById(id.BTN_TASK_PLAY_PREV) as HTMLButtonElement
    ).dispatchEvent(new Event("click"));
    expect(
      (document.getElementById(id.TASK_LBL) as HTMLLabelElement).textContent
    ).toEqual("SNAPSHOT 2 of 3");

    (document.getElementById(id.BTN_FIRST) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TASK_LBL) as HTMLLabelElement).textContent
    ).toEqual("SNAPSHOT 1 of 3");

    (document.getElementById(id.BTN_LAST) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TASK_LBL) as HTMLLabelElement).textContent
    ).toEqual("SNAPSHOT 3 of 3");

    (
      document.getElementById(id.BTN_RESTART) as HTMLButtonElement
    ).dispatchEvent(new Event("click"));
    expect(
      (document.getElementById(id.TASK_LBL) as HTMLLabelElement).textContent
    ).toEqual("SNAPSHOT 1 of 3");

    (document.getElementById(id.BTN_CLOSE) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TASK_CONTAINER) as HTMLTextAreaElement).style[
        "display"
      ]
    ).toEqual("none");
  });

  it("tests that screen/input btn do all right", () => {
    const pause = jest
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});

    const gui = new GUI(tasks);
    gui.createIdeGui(80, 25, 18, 2, tasks.text[0].codeHint);

    expect(
      (document.getElementById(id.TA_SCREEN) as HTMLDivElement).style["display"]
    ).toEqual("block");
    expect(
      (document.getElementById(id.TA_INPUT) as HTMLDivElement).style["display"]
    ).not.toEqual("block");
    (document.getElementById(id.BTN_SCREEN) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TA_SCREEN) as HTMLDivElement).style["display"]
    ).not.toEqual("block");
    expect(
      (document.getElementById(id.TA_INPUT) as HTMLDivElement).style["display"]
    ).toEqual("block");

    (document.getElementById(id.BTN_SCREEN) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.TA_SCREEN) as HTMLDivElement).style["display"]
    ).toEqual("block");
    expect(
      (document.getElementById(id.TA_INPUT) as HTMLDivElement).style["display"]
    ).not.toEqual("block");
  });

  it("tests that options btn really shows all options", () => {
    const pause = jest
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});

    const gui = new GUI(tasks);
    gui.createIdeGui(80, 25, 18, 2, tasks.text[0].codeHint);

    expect(
      (document.getElementById(id.OPTIONS_CONTAINER) as HTMLDivElement).style[
        "display"
      ]
    ).not.toEqual("flex");
    (
      document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement
    ).dispatchEvent(new Event("click"));
    expect(
      (document.getElementById(id.OPTIONS_CONTAINER) as HTMLDivElement).style[
        "display"
      ]
    ).toEqual("flex");

    (
      document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement
    ).dispatchEvent(new Event("click"));
    expect(
      (document.getElementById(id.OPTIONS_CONTAINER) as HTMLDivElement).style[
        "display"
      ]
    ).not.toEqual("flex");
  });

  it("tests that help btn really shows helpContainer", () => {
    const pause = jest
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});

    const gui = new GUI(tasks);
    gui.createIdeGui(80, 25, 18, 2, tasks.text[0].codeHint);

    expect(
      (document.getElementById(id.HELP_SCREEN) as HTMLDivElement).style[
        "display"
      ]
    ).not.toEqual("block");
    (document.getElementById(id.HELP_BTN) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.HELP_SCREEN) as HTMLDivElement).style[
        "display"
      ]
    ).toEqual("block");

    (document.getElementById(id.HELP_BTN) as HTMLButtonElement).dispatchEvent(
      new Event("click")
    );
    expect(
      (document.getElementById(id.HELP_SCREEN) as HTMLDivElement).style[
        "display"
      ]
    ).not.toEqual("block");
  });

  it("tests that program get need level from localstorage", () => {
    const lsItems: Record<string, string> = {};
    lsItems[cnst.LS_LEVEL_ITEM] = "1";

    const FakeStorage = {
      setItem: (item: string, val: string) => {
        lsItems[item] = val;
      },
      getItem: (item: string) => {
        return lsItems[item];
      },
    };

    Object.defineProperty(window, "localStorage", { value: FakeStorage });

    const pause = jest
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});

    const gui = new GUI(tasks);
    gui.pickTheLevelScreenSetVisible();
    expect(document.getElementById(id.PICK_LEVEL_CONTAINER)).not.toBeNull();
    const levels = document.querySelectorAll(
      `.${classes.PICK_LEVEL_SELECTOR_OPTIONS}`
    );
    expect(levels.length).toEqual(2);
    expect(levels[0].textContent).toEqual(`LEVEL 1: ${tasks.text[1].name}`);
    expect(levels[1].textContent).toEqual(`LEVEL 0: ${tasks.text[0].name}`);
  });
});
