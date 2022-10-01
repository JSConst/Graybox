import { ReturnPointer } from "../../src/script/lang/rPointer";

describe("ReturnPointer class tests", () => {
  it("tests that ReturnPointer is a class", () => {
    expect(ReturnPointer).toBeDefined();
    expect(new ReturnPointer("0", 0, 2)).toBeInstanceOf(ReturnPointer);
  });

  it("tests that ReturnPointer do all rightwith it's properties", () => {
    expect(ReturnPointer).toBeDefined();
    const rp = new ReturnPointer("123", 200, 2);
    expect(rp.value).toEqual("123");
    expect(rp.address).toEqual(200);
    expect(rp.size).toEqual(2);

    rp.value = "456";
    rp.address = 100;
    rp.size = 0;

    expect(rp.value).toEqual("456");
    expect(rp.address).toEqual(100);
    expect(rp.size).toEqual(0);
  });
});
