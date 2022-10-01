import * as msg from "../consts/messages";
import { Visualizer } from "./visualizer";
import { Task } from "./task";

export class Comparer {
  _options: number[];

  constructor(options: number[]) {
    this._options = options;
  }

  compare(
    strProg1: string,
    strProg2: string,
    strHist: string,
    errConsoleName: string,
    visualizer: Visualizer
  ) {
    const iHist = visualizer.getInputHistory(null, strHist);
    const task = new Task(strProg1.toUpperCase(), null, iHist, this._options);
    let prog: Task | null = null as unknown as Task;
    try {
      prog = new Task(
        strProg2.toUpperCase(),
        null,
        iHist.resetInputHistory(),
        this._options
      );
    } catch (e) {
      if (
        (e as Error).message !== msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)
      ) {
        (document.getElementById(errConsoleName) as HTMLTextAreaElement).style[
          "color"
        ] = "red";
        (document.getElementById(errConsoleName) as HTMLTextAreaElement).value =
          (e as Error).message.indexOf(
            msg.makeMsg(msg.MESSAGES.PARSE_INPUT_EMPTY_ERR)
          ) >= 0
            ? msg.makeMsg(msg.MESSAGES.UI_COMPARE_INPUT_ERR)
            : msg.makeMsg(
                msg.MESSAGES.UI_COMPARE_ERR,
                (e as Error).message.toLowerCase()
              );
        return 0;
      }
    }

    const taskHistSize = task.historySize;
    const progHistSize = prog.historySize;

    const taskScreen = task
      .getScreenElement(taskHistSize - 1)
      .trim()
      .split("\n");
    const progScreen = prog
      .getScreenElement(progHistSize - 1)
      .trim()
      .split("\n");
    const length = taskScreen.length;
    if (length !== progScreen.length) {
      (document.getElementById(errConsoleName) as HTMLTextAreaElement).style[
        "color"
      ] = "red";
      (document.getElementById(errConsoleName) as HTMLTextAreaElement).value =
        msg.makeMsg(msg.MESSAGES.UI_COMPARE_SCREEN_ERR);
      return 0;
    }

    for (let cnt = 0; cnt < length; cnt++) {
      if (taskScreen[cnt].trim() != progScreen[cnt].trim()) {
        (document.getElementById(errConsoleName) as HTMLTextAreaElement).style[
          "color"
        ] = "red";
        (document.getElementById(errConsoleName) as HTMLTextAreaElement).value =
          msg.makeMsg(msg.MESSAGES.UI_COMPARE_SCREEN_LINE_ERR, cnt + 1);
        return 0;
      }
    }

    task.setIdx(taskHistSize - 1);
    prog.setIdx(progHistSize - 1);

    if (task.getRamElement(task.idx) !== prog.getRamElement(prog.idx)) {
      (document.getElementById(errConsoleName) as HTMLTextAreaElement).style[
        "color"
      ] = "red";
      (document.getElementById(errConsoleName) as HTMLTextAreaElement).value =
        msg.makeMsg(msg.MESSAGES.UI_COMPARE_FINALLY_RAM_ERR);
      return 0;
    }

    while (true) {
      let hIdx = task.idx;
      let idx;
      for (idx = hIdx - 1; idx >= 0; idx--) {
        if (
          idx < taskHistSize - 1 &&
          task.getRamElement(idx) !== task.getRamElement(idx + 1)
        ) {
          break;
        }
      }
      idx < 0 && (idx = 0);
      task.setIdx(idx);

      hIdx = prog.idx;
      for (idx = hIdx - 1; idx >= 0; idx--) {
        if (
          idx < progHistSize - 1 &&
          prog.getRamElement(idx) !== prog.getRamElement(idx + 1)
        ) {
          break;
        }
      }
      idx < 0 && (idx = 0);
      prog.setIdx(idx);

      if (task.getRamElement(task.idx) !== prog.getRamElement(prog.idx)) {
        (document.getElementById(errConsoleName) as HTMLTextAreaElement).style[
          "color"
        ] = "red";
        (document.getElementById(errConsoleName) as HTMLTextAreaElement).value =
          msg.makeMsg(msg.MESSAGES.UI_COMPARE_RAM_ERR);
        return 0;
      }

      if (!task.idx || !prog.idx) {
        if (task.idx || prog.idx) {
          (
            document.getElementById(errConsoleName) as HTMLTextAreaElement
          ).style["color"] = "red";
          (
            document.getElementById(errConsoleName) as HTMLTextAreaElement
          ).value = msg.makeMsg(msg.MESSAGES.UI_COMPARE_RAM_ERR);
          return 0;
        }
        break;
      }
    }
    return 1;
  }
}
