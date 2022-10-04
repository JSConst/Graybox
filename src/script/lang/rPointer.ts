export class ReturnPointer {
  private _value: string;
  private _address: number;
  private _size: number;

  constructor(value: string, address: number, size: number) {
    this._value = value;
    this._address = address;
    this._size = size;
  }

  set value(val: string) {
    this._value = val;
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
  set size(size: number) {
    this._size = size;
  }
  get size() {
    return this._size;
  }
}
