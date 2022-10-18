import * as cnst from "../consts/const";

export type TaskDescriptor = {
  name: string;
  codeHint: string;
  testProg: string;
  testHist: string;
  checkHist: string;
  storyText?: string;
};

export type TaskList = {
  text: TaskDescriptor[];
  idx: number;
};

export let tasks: TaskList = {
  text: [
    {
      name: "NOTHING TO DO",
      codeHint:
        '0 PRINTLN "SOMETHING ABOUT DOING NOTHING"\n10 LET A$\n20 LET B\n30 INPUT A$\n40 INPUT B\n50 PRINT "VALUES IN MEMORY: \'"\n60 PRINT A$\n70 PRINT "\', "\n80 PRINTLN B',
      testProg:
        '0 PRINTLN "SOMETHING ABOUT DOING NOTHING"\n10 LET A$\n20 LET B\n30 INPUT A$\n40 INPUT B\n50 PRINT "VALUES IN MEMORY: \'"\n60 PRINT A$\n70 PRINT "\', "\n80 PRINTLN B',
      testHist:
        "Math.random().toFixed(Math.random() * 7)\n(Math.random() * 10) >>> 0",
      checkHist: `"${Math.random().toFixed(Math.random() * 7)}"\n${
        (Math.random() * 10) >>> 0
      }`,
      storyText: `${cnst.REPO_NAME}/story0.txt`,
    },
    {
      name: "THE END",
      codeHint:
        '0 REM THIS IS AN UNFINISHED VERSION OF THE GAME\n10 REM WITHOUT CONNECTING TO THE SERVER, ONLY ONE LEVEL IS AVAILABLE\n20 REM FOR NOW, THAT IS ALL\n30 PRINT "THE END"',
      testProg:
        '0 REM THIS IS AN UNFINISHED VERSION OF THE GAME\n10 REM WITHOUT CONNECTING TO THE SERVER, ONLY ONE LEVEL IS AVAILABLE\n20 REM FOR NOW, THAT IS ALL\n30 PRINT "THE END"',
      testHist: "",
      checkHist: "",
      storyText: `${cnst.REPO_NAME}/story4.txt`,
    },
  ],
  idx: 0,
};

export const getLevelsFromServer = async () => {
  let linkTasks: TaskList | null;
  const splittedLink = location.href.split("/");
  try {
    linkTasks = JSON.parse(
      atob(splittedLink[splittedLink.length - 1])
    ) as TaskList;
    for (const key in linkTasks.text[0]) {
      if (!tasks.text[0][key as keyof TaskDescriptor]) {
        throw new Error("Bad task list from the link");
      }
    }
  } catch (e) {
    linkTasks = null;
  }

  if (!linkTasks) {
    const response = await fetch(cnst.LEVELS_SRV).catch((err) => err);
    if (response.ok) {
      await response.json().then((data: { contents: string | null }) => {
        data.contents && (tasks = JSON.parse(data.contents));
      });
    }
  } else {
    tasks = linkTasks;
  }
  return tasks;
};
