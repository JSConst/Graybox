import * as msg from "../consts/messages";
import * as cnst from "../consts/const";
import { InputHistory } from "../lang/iHistory";
import { Parser } from "../lang/parser";
import { Executor } from "../lang/executor";
import { Environment } from "../lang/environment";
import { Visualizer } from "./visualizer";

export class Task {
  private _screenHistory: { [index: string]: string };
  private _ramHistory: { [index: string]: string };
  private _historySize: number;
  private _historyIdx: number;

  savedRamState: string | null;

  constructor(
    strProg: string,
    strInputHist: string | null,
    inputHist: InputHistory | null,
    options: number[]
  ) {
    const parser = new Parser();
    const exec = new Executor();

    const visualizer = new Visualizer();
    const inputHistory =
      inputHist !== null
        ? inputHist
        : visualizer.getInputHistory(null, strInputHist as string);

    const env = new Environment(256, 28, strProg.split("\n"), inputHistory);

    this._screenHistory = {};
    this._ramHistory = {};
    this._historySize = 0;
    this._historyIdx = 0;

    let counter = 0;
    while (true) {
      try {
        if (counter >= cnst.MAX_STEP_COUNT) {
          throw new Error(
            msg.makeMsg(msg.MESSAGES.EXE_LOOPING_MSG, cnst.MAX_STEP_COUNT)
          );
        }

        this._screenHistory[String(this._historySize)] = visualizer.showScreen(
          null,
          env.screen,
          env.screenLine,
          25
        );
        this._ramHistory[String(this._historySize)] = visualizer.showRam(
          null,
          env.variables,
          env.stack,
          env.ramSize,
          options[cnst.SIMB_SHOW_IDX],
          options[cnst.HEX_SHOW_IDX]
        );
        this._historySize++;

        if (
          exec.execute(parser.parse(env.getCurrentProgramLine(), env), env) !==
          0
        ) {
          if (!env.setNextLP()) {
            throw new Error(msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG));
          }
        }
        counter++;
      } catch (e) {
        if (
          (e as Error).message !== msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)
        ) {
          throw new Error((e as Error).message);
        }
        break;
      }
    }

    this.savedRamState = null;
  }

  incrementIdx() {
    if (this._historyIdx < this._historySize - 1) {
      this._historyIdx++;
    }
    return this._historyIdx;
  }

  decrementIdx() {
    if (this._historyIdx) {
      this._historyIdx--;
    }
    return this._historyIdx;
  }

  showScreen(taName: string, idx: number) {
    const textarea = document.getElementById(taName) as HTMLTextAreaElement;
    textarea.value = this._screenHistory[String(idx)];
  }

  showRam(taName: string, lblName: string, idx: number) {
    (
      document.getElementById(lblName) as HTMLLabelElement
    ).textContent = `SNAPSHOT ${idx + 1} of ${this._historySize}`;
    const textarea = document.getElementById(taName) as HTMLTextAreaElement;
    textarea.innerHTML = `<pre>${
      this.savedRamState
        ? Visualizer.prototype.ramVisualizationModify(
            this.savedRamState,
            (this.savedRamState = this._ramHistory[String(idx)])
          )
        : (this.savedRamState = this.ramHistory[String(idx)])
    }</pre>`;
  }

  getRamElement(idx: number) {
    return this._ramHistory[String(idx)];
  }

  getScreenElement(idx: number) {
    return this._screenHistory[String(idx)];
  }

  setIdx(idx: number): number {
    return (this._historyIdx = idx);
  }

  //getters
  get historySize() {
    return this._historySize;
  }
  get screenHistory() {
    return this._screenHistory;
  }
  get ramHistory() {
    return this._ramHistory;
  }
  get idx() {
    return this._historyIdx;
  }
}
