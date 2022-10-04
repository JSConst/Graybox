import "../scss/reset.scss";
import "../scss/style.scss";
import "../scss/fonts.scss";

import * as id from "./consts/id";
import { GUI } from "./gui/main";
import { getLevelsFromServer } from "./game/taskList";

const browserHistoryLength = history.length;

getLevelsFromServer().then((tasks) => {
  let gui = new GUI(tasks);
  gui.pickTheLevelScreenSetVisible();

  window.addEventListener("popstate", (e: Event) => {
    if (document.getElementById(id.PICK_LEVEL_CONTAINER)) {
      let pagesCount = history.length - browserHistoryLength;
      pagesCount <= 0 && (pagesCount = 1);
      history.go(-pagesCount);
    } else {
      gui.musicPlayer && gui.musicPlayer.pause();
      const mainDiv = document.getElementById(
        id.MAIN_CONTAINER
      ) as HTMLDivElement;
      mainDiv && (mainDiv.parentNode as HTMLElement).removeChild(mainDiv);
      gui = new GUI(tasks);
      gui.pickTheLevelScreenSetVisible();
    }
  });
});
