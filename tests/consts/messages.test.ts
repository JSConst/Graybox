import * as msg from "../../src/script/consts/messages";

describe("tests messages from the game", () => {
  it("simply test that all returned messages is a string", () => {
    for (let i = 0; i < 70; i++) {
      expect(typeof msg.makeMsg(i, i, i)).toEqual("string");
    }
  });
});
