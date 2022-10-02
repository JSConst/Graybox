import { getLevelsFromServer, tasks } from "../../src/script/game/taskList";

function mockResponse() {
  return new Promise((resolve) => {
    resolve({
      ok: true,
      status: 200,
      json: () =>
        new Promise((resolve) => {
          resolve({ contents: JSON.stringify({ text: ["test"], idx: 0 }) });
        }),
    });
  });
}
global.fetch = jest.fn().mockImplementation(mockResponse);

describe("test that function get levels from server", () => {
  it("tests that function is exists", () => {
    expect(getLevelsFromServer).toBeDefined();
    expect(getLevelsFromServer).toBeInstanceOf(Function);
  });

  it("tests that function do all right if response is OK", async () => {
    await getLevelsFromServer();
    expect(tasks).toEqual({ text: ["test"], idx: 0 });
  });
});
