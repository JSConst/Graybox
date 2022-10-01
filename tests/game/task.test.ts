import { Task } from "../../src/script/game/task";

describe("test Task class", () => {
  it("tests that Task it is the class", () => {
    expect(Task).toBeDefined();
    expect(
      new Task("0 LET A = 1", "", null, [0, 0, 0, 0, 0, 0])
    ).toBeInstanceOf(Task);
  });

  it("tests that instance of Task class do all right", () => {
    document.body.innerHTML =
      "<textarea id='ta1'></textarea><textarea id='ta2'></textarea><label id='lbl'></label>";
    const task = new Task(
      '0 PRINT "123"\n1 LET A = 1',
      "",
      null,
      [0, 0, 0, 0, 0, 0]
    );

    expect(
      (document.getElementById("ta1") as HTMLTextAreaElement).value.trim()
    ).toEqual("");
    task.showScreen("ta1", 1);
    expect(
      (document.getElementById("ta1") as HTMLTextAreaElement).value.trim()
    ).toEqual("123");
    expect(task.screenHistory[2].trim()).toEqual("123");

    expect(
      (document.getElementById("lbl") as HTMLLabelElement).textContent
    ).toEqual("");
    expect(
      (document.getElementById("ta2") as HTMLTextAreaElement).innerHTML.match(
        "01"
      )
    ).toEqual(null);
    task.showRam("ta2", "lbl", 2);
    expect(
      (document.getElementById("lbl") as HTMLLabelElement).textContent
    ).toEqual("SNAPSHOT 3 of 3");
    expect(
      (document.getElementById("ta2") as HTMLTextAreaElement).innerHTML.match(
        "01"
      )
    ).not.toEqual(null);
  });
});
