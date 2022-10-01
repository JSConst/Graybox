import { Variable } from "../../src/script/lang/variable";

describe("tests Variable class", () => {
  it("tests that Variable is a class", () => {
    expect(Variable).toBeDefined();
    expect(new Variable("A", 255, 0, 0, 1)).toBeInstanceOf(Variable);
  });

  it("tests that number variables are created right", () => {
    const bVar = new Variable("B", 255, 10, 0, 1);
    expect(bVar.name).toEqual("B");
    expect(bVar.value).toEqual("-1");
    expect(bVar.address).toEqual(10);
    expect(bVar.type).toEqual(0);

    bVar.address = 0;
    bVar.name = "C";
    bVar.type = 1;
    bVar.value = "123";

    expect(bVar.name).toEqual("C");
    expect(bVar.value).toEqual("123");
    expect(bVar.address).toEqual(0);
    expect(bVar.type).toEqual(1);
  });

  it("tests that string variables are created right", () => {
    const cVar = new Variable("C", "123", 0, 1, 9);
    expect(cVar.name).toEqual("C");
    expect(cVar.value).toEqual("123");
    expect(cVar.address).toEqual(0);
    expect(cVar.type).toEqual(1);

    cVar.address = 10;
    cVar.name = "B";
    cVar.type = 0;
    cVar.value = -1;

    expect(cVar.name).toEqual("B");
    expect(cVar.value).toEqual("-1");
    expect(cVar.address).toEqual(10);
    expect(cVar.type).toEqual(0);
  });
});
