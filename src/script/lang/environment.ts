import * as msg from "../consts/messages";
import { InputHistory } from "./iHistory";
import { Variable } from "./variable";
import { ReturnPointer } from "./rPointer";

export class Environment {
  private _lp: string;
  private _program: string[];
  private _lineNumbers: string[];
  private _inputHistory: InputHistory;

  private _ramSize: number;
  private _varCount: number;
  private _variables: { [index: string]: Variable };

  private _stack: { [index: string]: ReturnPointer };

  private _currentStackAddr: number;
  private _currentHeapAddr: number;

  private _screen: { [index: string]: string };
  private _screenLine: number;

  constructor(
    ramSize: number,
    varCount: number,
    program: string[],
    inputHistory: InputHistory
  ) {
    this._lp = msg.IDE_NA;

    let emptyFlag = 1;

    //check that the all program lines had sequental numbering and program is not empty
    for (let i = 0; i < program.length; i++) {
      const trimmedStr = program[i].trim();
      if (trimmedStr.length === 0) {
        continue;
      }

      trimmedStr[trimmedStr.length - 1] === ";" &&
        msg.throwError(this._lp, msg.MESSAGES.IDE_SEMICOLON_ERR);
      emptyFlag = 0;

      const number = Number(program[i].trim().split(" ")[0]);
      String(number) === "NaN" &&
        msg.throwError(this._lp, msg.MESSAGES.IDE_WRONG_NUMBER_ERR);
      if (number < 0) {
        msg.throwError(this._lp, msg.MESSAGES.IDE_NEGATIVE_NUMBER_ERR, number);
      }

      if (i) {
        const prev =
          i - 1 || program[i - 1].trim().length
            ? Number(program[i - 1].trim().split(" ")[0])
            : -1;
        number <= prev &&
          msg.throwError(
            this._lp,
            msg.MESSAGES.IDE_UNSEQUENTAL_NUMBER_ERR,
            number,
            prev
          );
      }

      //!!! ïðîâåðèòü íåäîïóñòèìûå ñèìâîëû ^,&,~ è ò.ä âåçäå êðîìå ñòðîêîâûõ êîíñòàíò
      //!!! çàìåíèòü AND NOT OR XOR íà & ! è ò.ä.

      program[i] = trimmedStr;
    }
    emptyFlag && msg.throwError(this._lp, msg.MESSAGES.IDE_EMPTY_CODE_ERR);

    //program - array of sorted lines
    this._program = program.filter((el) => {
      return el.trim().length ? true : false;
    });
    this._lineNumbers = this._program.map((el) => {
      return el.split(" ")[0];
    });
    //last empty line adding for viewing last step operation
    this._lineNumbers.push(
      this._lineNumbers[this._lineNumbers.length - 1] + "1"
    );
    this._program.push(this._lineNumbers[this._lineNumbers.length - 1]);

    //line pointer (LP)
    this._lp = this._lineNumbers[0];

    //history for console inputs
    this._inputHistory = inputHistory;

    //local RAM size in bytes
    this._ramSize = ramSize;
    //local variables count
    this._varCount = varCount;
    //all knowing variables
    this._variables = {};

    //all knowing return pointers
    this._stack = {};

    //current stack and heap addresses
    this._currentStackAddr = ramSize;
    this._currentHeapAddr = 0;

    //fake console
    this._screen = {};

    //fake console current line
    this._screenLine = 0;
  }

  //get program line by LP
  getCurrentProgramLine(): string {
    return this._program[this._lineNumbers.indexOf(this._lp)];
  }

  //get empty heap address
  getEmptyHeapAddr(size: number): number | null {
    let currentAddr = 0;
    for (const el in this._variables) {
      const lastAddr = this._variables[el].address + this._variables[el].size;
      if (lastAddr > currentAddr) {
        currentAddr = lastAddr;
      }
    }
    return currentAddr + size >= this._currentStackAddr
      ? null
      : (this._currentHeapAddr = currentAddr);
  }

  //create new variable
  createVar(name: string, value: string | number) {
    !this._varCount && msg.throwError(this._lp, msg.MESSAGES.VAR_TOO_MANY_ERR);
    const type = name.indexOf("$") >= 0 ? 1 : 0;
    //for zero-terminated strings, length is bigger by 1 of max size for the tail zero
    const size = type ? 9 : 1;
    const address = this.getEmptyHeapAddr(size);
    address === null &&
      msg.throwError(this.lp, msg.MESSAGES.VAR_MEMORY_FULL_ERR, name);
    if (name[name.length - 1] >= "0" && name[name.length - 1] <= "7") {
      name in this._variables &&
        msg.throwError(this._lp, msg.MESSAGES.VAR_DEFINED_ERR, name[0]);
      for (const variable in this._variables) {
        name[0] === this._variables[variable].name[0] &&
          (name[1] === this._variables[variable].name[2] ||
            name[2] === this._variables[variable].name[1]) &&
          msg.throwError(this._lp, msg.MESSAGES.VAR_DEFINED_ERR, name[0]);
      }
      name[name.length - 1] === "0" && this._varCount--;
    } else {
      name in this._variables &&
        msg.throwError(this._lp, msg.MESSAGES.VAR_DEFINED_ERR, name[0]);
      name[0] in this._variables &&
        msg.throwError(this._lp, msg.MESSAGES.VAR_DEFINED_ERR, name[0]);
      name[0] + "$" in this._variables &&
        msg.throwError(this._lp, msg.MESSAGES.VAR_DEFINED_ERR, name[0]);
      this._varCount--;
    }
    !type &&
      typeof value === "number" &&
      (value = String(((value & 0xff) ^ 0x80) - 0x80));
    this._variables[name] = new Variable(
      name,
      value,
      address as number,
      type,
      size
    );
  }

  //get empty stack address
  getEmptyStackAddr(size: number): number | null {
    let currentAddr = this._ramSize;
    for (const el in this.stack) {
      const lastAddr = this._stack[el].address;
      lastAddr < currentAddr && (currentAddr = lastAddr);
    }
    return currentAddr - size <= this._currentHeapAddr
      ? null
      : (this._currentStackAddr = currentAddr - size);
  }

  //create new return pointer
  createRP(value: string): void {
    const size = 2;
    const address = this.getEmptyStackAddr(size);
    address === null && msg.throwError(this.lp, msg.MESSAGES.VAR_POINTER_ERR);
    this._stack[String(address)] = new ReturnPointer(
      value,
      address as number,
      size
    );
  }

  //delete last return pointer
  deleteRP = (): string | null => {
    let currentAddr = this._ramSize;
    for (const el in this.stack) {
      const lastAddr = this._stack[el].address;
      lastAddr < currentAddr && (currentAddr = lastAddr);
    }
    if (currentAddr !== this._ramSize) {
      const value = this._stack[String(currentAddr)].value;
      delete this._stack[String(currentAddr)];
      return value;
    }
    return null;
  };

  //set LP to next command line
  setNextLP(): string | null {
    return this._lineNumbers.indexOf(this._lp) + 1 >
      this._lineNumbers.length - 1
      ? null
      : (this._lp = this._lineNumbers[this._lineNumbers.indexOf(this._lp) + 1]);
  }

  //PRINT(LN) to console
  screenPrint(msg: string, ln: number): void {
    this._screen[String(this._screenLine)] = this._screen[
      String(this._screenLine)
    ]
      ? (this._screen[String(this._screenLine)] += String(msg))
      : (this._screen[String(this._screenLine)] = String(msg));
    while (this._screen[String(this._screenLine)].length > 80) {
      this._screen[String(this._screenLine + 1)] =
        this._screen[String(this._screenLine)].slice(80);
      this._screen[String(this._screenLine)] = this._screen[
        String(this._screenLine)
      ].slice(0, 80);
      this._screenLine++;
    }
    //if PRINTLN command then adding \n
    if (ln) {
      this._screenLine++;
    }
  }

  setVariableByName(name: string, variable: Variable): void {
    this._variables[name] = variable;
  }

  getVariableByName(name: string): Variable | null {
    return this._variables[name] ? this._variables[name] : null;
  }

  setLp(val: string): string | null {
    return this._lineNumbers.indexOf(String(val)) >= 0
      ? (this._lp = String(val))
      : null;
  }

  //getters
  get variables() {
    return this._variables;
  }
  get stack() {
    return this._stack;
  }
  get lp() {
    return this._lp;
  }
  get program() {
    return this._program;
  }
  get inputHistory() {
    return this._inputHistory;
  }
  get ramSize() {
    return this._ramSize;
  }
  get screen() {
    return this._screen;
  }
  get screenLine() {
    return this._screenLine;
  }
}
