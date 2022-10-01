export class InputHistory {
  private _history: Record<string, string>;
  private _histValCount: number;
  private _currentHistElem: number;

  constructor() {
    this._history = {};
    this._histValCount = 0;
    this._currentHistElem = 0;
  }

  //adding history element
  addInputHistoryElement = (el: string): void => {
    this._history[String(this._histValCount)] = el;
    this._histValCount++;
  };

  //get next input value
  getNextInputValue = (): string | null => {
    if (!this._history[String(this._currentHistElem)]) {
      return null;
    }
    const rslt = eval(this._history[String(this._currentHistElem)]);
    this._currentHistElem++;
    return typeof rslt === "number" ? String(rslt) : `"${rslt}"`;
  };

  //reset history to start
  resetInputHistory = (): InputHistory => {
    this._currentHistElem = 0;
    return this;
  };
}
