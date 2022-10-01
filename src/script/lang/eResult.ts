export class ExpressionResult {
  private _rslt: number | string;
  private _type: number;

  constructor(rslt: number | string, type: number) {
    this._rslt = rslt;
    this._type = type;
  }

  //getters
  get rslt() {
    return this._rslt;
  }

  get type() {
    return this._type;
  }
}
