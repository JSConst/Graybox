export class Command {
  //command name
  private _name: string;

  //operand (operator)
  private _operand: string | null;

  //expresion (condition)
  private _expression: string | null;

  constructor(name: string, operand: string | null, expression: string | null) {
    this._name = name;
    this._operand = operand;
    this._expression = expression;
  }

  //setters
  set name(name: string) {
    this._name = name;
  }
  //getters
  get name() {
    return this._name;
  }
  set operand(operand: string | null) {
    this._operand = operand;
  }
  get operand() {
    return this._operand;
  }
  set expression(expr: string | null) {
    this._expression = expr;
  }
  get expression() {
    return this._expression;
  }
}
