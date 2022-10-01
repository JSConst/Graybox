import * as msg from "../consts/messages";
import * as cnst from "../consts/const";
import { Parser } from "../lang/parser";
import { Environment } from "../lang/environment";
import { InputHistory } from "../lang/iHistory";
import { Executor } from "../lang/executor";

export class ProgramRunner {
  private _consoleId: string;
  private _parser: Parser;
  private _exec: Executor;

  private _inputHistory: InputHistory;
  private _env: Environment;

  constructor(str: string, iHist: InputHistory | null, consoleId: string) {
    this._consoleId = consoleId;
    this._parser = new Parser();
    this._exec = new Executor();

    if (iHist) {
      this._inputHistory = iHist;
    } else {
      this._inputHistory = new InputHistory();
    }
    this._env = new Environment(256, 28, str.split("\n"), this._inputHistory);
  }

  run() {
    let counter = 0;
    while (counter < cnst.MAX_STEP_COUNT) {
      if (
        this._exec.execute(
          this._parser.parse(this.env.getCurrentProgramLine(), this._env),
          this._env
        ) !== 0 /*null*/
      ) {
        if (!this._env.setNextLP()) {
          throw new Error(msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG));
        }
      }
      counter++;
    }
    throw new Error(
      msg.makeMsg(msg.MESSAGES.EXE_LOOPING_MSG, cnst.MAX_STEP_COUNT)
    );
  }

  step() {
    (document.getElementById(this._consoleId) as HTMLTextAreaElement).style[
      "color"
    ] = "green";
    (document.getElementById(this._consoleId) as HTMLTextAreaElement).value =
      `EXECUTED LINE:\n${this.env.getCurrentProgramLine()}`.toLowerCase();
    if (
      this._exec.execute(
        this._parser.parse(this._env.getCurrentProgramLine(), this.env),
        this._env
      ) !== 0 /*null*/
    ) {
      if (!this.env.setNextLP()) {
        throw new Error("EXECUTION COMPLITED SUCCESSFULLY!");
      }
    }
  }

  get env() {
    return this._env;
  }
}
