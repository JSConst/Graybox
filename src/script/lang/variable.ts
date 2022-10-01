export class Variable {
  //variable name
  private _name: string;
  //variable value in string format
  private _value: string;
  //variable address in memory
  private _address: number;
  //variable type (0 - number, 1 - string)
  private _type: number;
  //variable size
  private _size: number;

  constructor(
    name: string,
    value: number | string,
    address: number,
    type: number,
    size: number
  ) {
    this._name = name;
    this._address = address;
    this._type = type;
    this._size = size;

    !type &&
      typeof value === "number" &&
      (value = ((value & 0xff) ^ 0x80) - 0x80);
    this._value = String(value);
  }

  //setters
  set name(name: string) {
    this._name = name;
  }
  get name() {
    return this._name;
  }
  set value(val: number | string) {
    !this._type &&
      typeof val === "number" &&
      (val = ((val & 0xff) ^ 0x80) - 0x80);
    this._value = String(val);
  }
  get value() {
    return this._value;
  }
  set address(addr: number) {
    this._address = addr;
  }
  get address() {
    return this._address;
  }
  set type(type: number) {
    this._type = type;
  }
  get type() {
    return this._type;
  }
  set size(size: number) {
    this._size = size;
  }
  get size() {
    return this._size;
  }
}
