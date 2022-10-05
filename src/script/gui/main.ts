import * as msg from "../consts/messages";
import * as cnst from "../consts/const";
import * as id from "../consts/id";
import * as classes from "../consts/class";
import * as caption from "../consts/caption";

import { ProgramRunner } from "../game/pRunner";
import { Visualizer } from "../game/visualizer";
import { Comparer } from "../game/comparer";
import { Task } from "../game/task";
import { TaskList } from "../game/taskList";

import { logo } from "./logo";

export class GUI {
  private _options: number[];
  private _programRunner: ProgramRunner | null;
  private _visualizer: Visualizer;
  private _task: Task;
  private _tasks: TaskList;
  private _testProg: string;
  private _checkHist: string;
  private _testHist: string;
  private _musicPlayer: HTMLAudioElement | null;

  constructor(tasks: TaskList) {
    const opt: string | null = window.localStorage.getItem(cnst.LS_OPT_ITEM);
    this._options = opt
      ? JSON.parse(opt)
      : (this._options = [
          cnst.SIMB_SHOW_INIT_VAL,
          cnst.HEX_SHOW_INIT_VAL,
          cnst.HINTS_SHOW_INIT_VAL,
          cnst.HELP_SHOW_INIT_VAL,
          cnst.PLAY_MUSIC_INIT_VAL,
          cnst.ONE_SCREEN_INIT_VAL,
        ]);

    this._programRunner = null;
    this._visualizer = new Visualizer();

    this._tasks = tasks;

    this._testProg = tasks.text[tasks.idx].testProg;
    this._checkHist = tasks.text[tasks.idx].checkHist;
    this._testHist = tasks.text[tasks.idx].testHist;
    this._task = new Task(
      this._testProg.toUpperCase(),
      this._testHist,
      null,
      this._options
    );
    this._musicPlayer = null;
  }

  pickTheLevelScreenSetVisible() {
    let curLevel = Number(window.localStorage.getItem(cnst.LS_LEVEL_ITEM)) || 0;
    curLevel >= this._tasks.text.length &&
      (curLevel = this._tasks.text.length - 1);

    history.pushState(null, "", null);

    const logoContainer = document.createElement("div");
    logoContainer.id = id.LOGO_CONTAINER;
    logoContainer.classList.add(classes.LOGO);
    logoContainer.innerHTML = `<pre>${logo}</pre>`;

    const pickLevelContainer = document.createElement("div");
    pickLevelContainer.id = id.PICK_LEVEL_CONTAINER;
    pickLevelContainer.className = classes.MENUBAR;
    (document.querySelector("section") as HTMLElement).appendChild(
      pickLevelContainer
    );
    (document.querySelector("section") as HTMLElement).appendChild(
      logoContainer
    );

    const sel = document.createElement("div");
    sel.className = classes.PICK_LEVEL_SELECTOR;
    sel.addEventListener("click", (e) => {
      (e.currentTarget as HTMLDivElement).style["height"] = "auto";
    });

    for (let i: number = curLevel; i >= 0; i--) {
      const opt = document.createElement("div");
      opt.textContent = msg.makeMsg(
        msg.MESSAGES.UI_PICK_THE_LEVEL,
        i,
        this._tasks.text[i].name
      );
      opt.className = classes.PICK_LEVEL_SELECTOR_OPTIONS;
      opt.setAttribute(cnst.IDX_ATTRIBUTE_NAME, String(i));
      opt.addEventListener("click", (e) => {
        this.startGame(
          Number(
            (e.currentTarget as HTMLDivElement).getAttribute(
              cnst.IDX_ATTRIBUTE_NAME
            )
          )
        );
        (document.querySelector("section") as HTMLElement).removeChild(
          document.getElementById(id.PICK_LEVEL_CONTAINER) as HTMLDivElement
        );
        (document.querySelector("section") as HTMLElement).removeChild(
          document.getElementById(id.LOGO_CONTAINER) as HTMLDivElement
        );
      });
      sel.appendChild(opt);
    }

    const btn = document.createElement("button");
    btn.className = classes.MENU_BTN;
    btn.innerHTML = msg.makeMsg(msg.MESSAGES.UI_GO_TO_THE_LEVEL);
    btn.addEventListener("click", (e) => {
      this.startGame(curLevel);
      (document.querySelector("section") as HTMLElement).removeChild(
        document.getElementById(id.PICK_LEVEL_CONTAINER) as HTMLDivElement
      );
      (document.querySelector("section") as HTMLElement).removeChild(
        document.getElementById(id.LOGO_CONTAINER) as HTMLDivElement
      );
    });

    pickLevelContainer.appendChild(sel);
    pickLevelContainer.appendChild(btn);
  }

  startGame(curLevel: number, hideStoryText?: boolean) {
    this._tasks.idx = Number(curLevel);

    this._programRunner = null;
    this._visualizer = new Visualizer();

    this._testProg = this._tasks.text[this._tasks.idx].testProg;
    this._testHist = this._tasks.text[this._tasks.idx].testHist;
    this._checkHist = this._tasks.text[this._tasks.idx].checkHist;

    this._task = new Task(
      this._testProg.toUpperCase(),
      this._testHist,
      null,
      this._options
    );

    this.createIdeGui(
      80,
      25,
      18,
      2,
      this._tasks.text[this._tasks.idx].codeHint
    );
    if (!hideStoryText && this._tasks.text[this._tasks.idx].storyText) {
      (document.getElementById(id.HELP_PAGE) as HTMLIFrameElement).src = this
        ._tasks.text[this._tasks.idx].storyText as string;
      (document.getElementById(id.HELP_BTN) as HTMLButtonElement).dispatchEvent(
        new MouseEvent("click")
      );
    }
  }

  changeAllBtnsHelpStrings(visible: number) {
    const btnMOver = (e: MouseEvent) => {
      const helpString = (e.currentTarget as HTMLButtonElement).getAttribute(
        cnst.HELP_STRING_ATTRIBUTE_NAME
      );
      if (helpString) {
        const lbl = document.getElementById(
          id.MENUBAR_WARN_LBL
        ) as HTMLLabelElement;
        lbl.innerHTML = helpString;
        lbl.style["display"] = "inline-block";
      }
    };
    const btnMOut = (e: MouseEvent) => {
      if ((e.currentTarget as HTMLButtonElement).getAttribute("helpString")) {
        const lbl = document.getElementById(
          id.MENUBAR_WARN_LBL
        ) as HTMLLabelElement;
        lbl.style["display"] = "none";
      }
    };

    const allBtns = document.querySelectorAll("button");
    const length = allBtns.length;
    if (visible) {
      for (let i = 0; i < length; i++) {
        (allBtns[i] as HTMLButtonElement).onmouseover = btnMOver;
        (allBtns[i] as HTMLButtonElement).onmouseout = btnMOut;
      }
    } else {
      for (let i = 0; i < length; i++) {
        (allBtns[i] as HTMLButtonElement).onmouseover = null;
        (allBtns[i] as HTMLButtonElement).onmouseout = null;
      }
    }
    (document.getElementById(id.MENUBAR_WARN_LBL) as HTMLLabelElement).style[
      "display"
    ] = "none";
  }

  createIdeGui(
    cols: number,
    rows1: number,
    rows2: number,
    rows3: number,
    codeStr: string
  ) {
    let mainDiv = document.getElementById(id.MAIN_CONTAINER) as HTMLDivElement;
    if (mainDiv) {
      (mainDiv.parentNode as HTMLElement).removeChild(mainDiv);
    }
    mainDiv = document.createElement("div");
    mainDiv.id = id.MAIN_CONTAINER;
    mainDiv.className = classes.MAIN_CONTAINER;
    (document.querySelector("section") as HTMLElement).appendChild(mainDiv);

    const textareas: (HTMLTextAreaElement | HTMLDivElement)[] = [];
    //important! taRam should not be first in array
    const tareaIDs = [
      id.TA_CONSOLE,
      id.TA_CODE,
      id.TA_RAM,
      id.TA_SCREEN,
      id.TA_INPUT,
    ];
    let length = tareaIDs.length;
    for (let i = 0; i < length; i++) {
      if (tareaIDs[i] === id.TA_RAM) {
        textareas[i] = document.createElement("div");
        textareas[i].className = classes.TA_RAM;
      } else {
        textareas[i] = document.createElement("textarea");
        (textareas[i] as HTMLTextAreaElement).cols = cols;
        textareas[i].className = classes.TA_MAIN;
      }
      textareas[i].id = tareaIDs[i];
    }

    (textareas[1] as HTMLTextAreaElement).rows = rows2;
    (textareas[3] as HTMLTextAreaElement).rows = (
      textareas[4] as HTMLTextAreaElement
    ).rows = rows1;
    (textareas[0] as HTMLTextAreaElement).rows = rows3;

    (textareas[0] as HTMLTextAreaElement).readOnly = (
      textareas[3] as HTMLTextAreaElement
    ).readOnly = true;
    textareas[0].tabIndex = textareas[2].tabIndex = textareas[3].tabIndex = -1;
    textareas[0].style["display"] =
      textareas[1].style["display"] =
      textareas[3].style["display"] =
        "block";

    textareas[4].style["font-variant" as unknown as number] = "small-caps";

    const btnNames = [
      caption.BTN_RUN_CAPTION,
      caption.BTN_STEP_CAPTION,
      caption.BTN_RST_CAPTION,
      caption.BTN_CODE_CAPTION,
      caption.BTN_SCREEN_CAPTION,
      caption.BTN_SHOW_CAPTION,
      caption.BTN_CHECK_CAPTION,
      caption.BTN_NEXT_CAPTION,
    ];
    const btnIDs = [
      id.BTN_RUN,
      id.BTN_STEP,
      id.BTN_RST,
      id.BTN_CODE,
      id.BTN_SCREEN,
      id.BTN_SHOW,
      id.BTN_CHECK,
      id.BTN_NEXT,
    ];
    const btnHelp = [
      caption.BTN_RUN_HELP,
      caption.BTN_STEP_HELP,
      caption.BTN_RST_HELP,
      caption.BTN_CODE_HELP,
      caption.BTN_SCREEN_HELP,
      caption.BTN_SHOW_HELP,
      caption.BTN_CHECK_HELP,
      caption.BTN_NEXT_HELP,
    ];
    const btns = [];
    length = btnNames.length;
    for (let i = 0; i < length; i++) {
      btns[i] = document.createElement("button");
      btns[i].innerHTML = btnNames[i];
      btns[i].id = btnIDs[i];
      btns[i].className = classes.BTN_MAIN;
      btns[i].setAttribute(cnst.HELP_STRING_ATTRIBUTE_NAME, btnHelp[i]);
    }

    btns[7].style["display"] = "none";

    const btnsContainer = document.createElement("div");
    btnsContainer.className = classes.BTN_LEFT;

    const btnsDebugContainer = document.createElement("div");
    btnsDebugContainer.className = classes.BTN_RIGHT;

    //button "run"
    btns[0].addEventListener("click", (e) => {
      (document.getElementById("btnReset") as HTMLButtonElement).click();
      try {
        this._programRunner ||
          (this._programRunner = new ProgramRunner(
            (
              document.getElementById(id.TA_CODE) as HTMLInputElement
            ).value.toUpperCase(),
            this._visualizer.getInputHistory(id.TA_INPUT, null),
            id.TA_CONSOLE
          ));
        this._programRunner.run();
      } catch (e) {
        (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).style[
          "color"
        ] =
          (e as Error).message === msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)
            ? "green"
            : "red";
        (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).value = (
          e as Error
        ).message.toLowerCase();
        if (
          (e as Error).message !== msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)
        ) {
          //!!! TEMP !!! need actual ramsize const
          this._visualizer.showRam(
            id.TA_RAM,
            null,
            null,
            256,
            this._options[cnst.SIMB_SHOW_IDX],
            this._options[cnst.HEX_SHOW_IDX]
          );
          this._visualizer.showScreen(id.TA_SCREEN, null, 0, 25);
          this._programRunner = null;
        } else {
          this._programRunner &&
            this._visualizer.showRam(
              id.TA_RAM,
              this._programRunner.env.variables,
              this._programRunner.env.stack,
              this._programRunner.env.ramSize,
              this._options[cnst.SIMB_SHOW_IDX],
              this._options[cnst.HEX_SHOW_IDX]
            );
          this._programRunner &&
            this._visualizer.showScreen(
              id.TA_SCREEN,
              this._programRunner.env.screen,
              this._programRunner.env.screenLine,
              25
            );
        }
      }
    });

    //button "step"
    btns[1].addEventListener("click", (e) => {
      try {
        this._programRunner ||
          (this._programRunner = new ProgramRunner(
            (
              document.getElementById(id.TA_CODE) as HTMLInputElement
            ).value.toUpperCase(),
            this._visualizer.getInputHistory(id.TA_INPUT, null),
            id.TA_CONSOLE
          ));
        this._programRunner.step();
        this._visualizer.showRam(
          id.TA_RAM,
          this._programRunner.env.variables,
          this._programRunner.env.stack,
          this._programRunner.env.ramSize,
          this._options[cnst.SIMB_SHOW_IDX],
          this._options[cnst.HEX_SHOW_IDX]
        );
        this._visualizer.showScreen(
          id.TA_SCREEN,
          this._programRunner.env.screen,
          this._programRunner.env.screenLine,
          25
        );
        this._visualizer.changeShowedRamState(id.TA_RAM);
      } catch (e) {
        (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).style[
          "color"
        ] =
          (e as Error).message === msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)
            ? "green"
            : "red";
        (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).value = (
          e as Error
        ).message.toLowerCase();
        if (
          (e as Error).message !== msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)
        ) {
          //!!! TEMP !!! need actual ramsize const
          this._visualizer.showRam(
            id.TA_RAM,
            null,
            null,
            256,
            this._options[cnst.SIMB_SHOW_IDX],
            this._options[cnst.HEX_SHOW_IDX]
          );
          this._visualizer.showScreen(id.TA_SCREEN, null, 0, 25);
          this._programRunner = null;
        } else {
          this._programRunner &&
            this._visualizer.showRam(
              id.TA_RAM,
              this._programRunner.env.variables,
              this._programRunner.env.stack,
              this._programRunner.env.ramSize,
              this._options[cnst.SIMB_SHOW_IDX],
              this._options[cnst.HEX_SHOW_IDX]
            );
          this._programRunner &&
            this._visualizer.showScreen(
              id.TA_SCREEN,
              this._programRunner.env.screen,
              this._programRunner.env.screenLine,
              25
            );
        }
      }
    });

    //button "reset"
    btns[2].addEventListener("click", (e) => {
      this._programRunner = null;
      (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).value = "";

      //!!! TEMP !!! need actual ramsize const
      this._visualizer.showRam(
        id.TA_RAM,
        null,
        null,
        256,
        this._options[cnst.SIMB_SHOW_IDX],
        this._options[cnst.HEX_SHOW_IDX]
      );
      this._visualizer.showScreen(id.TA_SCREEN, null, 0, 25);
    });

    //button "code/ram"
    btns[3].addEventListener("click", (e) => {
      const btn = document.getElementById(id.BTN_CODE) as HTMLButtonElement;
      if (btn.innerHTML === caption.BTN_RAM_CAPTION) {
        this._visualizer.showNeedTextArea([id.TA_CODE, id.TA_RAM], 0);
        btn.innerHTML = caption.BTN_CODE_CAPTION;
      } else {
        if (this._programRunner) {
          this._visualizer.showRam(
            id.TA_RAM,
            this._programRunner.env.variables,
            this._programRunner.env.stack,
            this._programRunner.env.ramSize,
            this._options[cnst.SIMB_SHOW_IDX],
            this._options[cnst.HEX_SHOW_IDX]
          );
        } else {
          //!!! TEMP !!! need actual ramsize const
          this._visualizer.showRam(
            id.TA_RAM,
            null,
            null,
            256,
            this._options[cnst.SIMB_SHOW_IDX],
            this._options[cnst.HEX_SHOW_IDX]
          );
        }

        this._visualizer.showNeedTextArea([id.TA_CODE, id.TA_RAM], 1);
        btn.innerHTML = caption.BTN_RAM_CAPTION;
      }
    });

    //button "screenInput"
    btns[4].addEventListener("click", (e) => {
      const btn = document.getElementById(id.BTN_SCREEN) as HTMLButtonElement;
      if (btn.innerHTML === caption.BTN_INPUT_CAPTION) {
        if (this._programRunner) {
          this._visualizer.showScreen(
            id.TA_SCREEN,
            this._programRunner.env.screen,
            this._programRunner.env.screenLine,
            25
          );
        } else {
          this._visualizer.showScreen(id.TA_SCREEN, null, 0, 25);
        }

        this._visualizer.showNeedTextArea([id.TA_SCREEN, id.TA_INPUT], 0);
        btn.innerHTML = caption.BTN_SCREEN_CAPTION;
      } else {
        this._visualizer.showNeedTextArea([id.TA_SCREEN, id.TA_INPUT], 1);
        btn.innerHTML = caption.BTN_INPUT_CAPTION;
      }
    });

    //button "show"
    btns[5].addEventListener("click", (e) => {
      if (
        window.screen.availWidth > cnst.MIN_WIDE_SCREEN_WIDTH &&
        this._options[cnst.ONE_SCREEN_IDX]
      ) {
        if (
          (document.getElementById(id.BTN_SHOW) as HTMLButtonElement)
            .innerHTML === caption.BTN_HIDE_CAPTION
        ) {
          (
            document.getElementById(id.BTN_SHOW) as HTMLButtonElement
          ).innerHTML = caption.BTN_SHOW_CAPTION;
          (document.getElementById(id.TASK_CONTAINER) as HTMLDivElement).style[
            "display"
          ] = "none";
        } else {
          (
            document.getElementById(id.BTN_SHOW) as HTMLButtonElement
          ).innerHTML = caption.BTN_HIDE_CAPTION;
          (document.getElementById(id.TASK_CONTAINER) as HTMLDivElement).style[
            "display"
          ] = "block";
          this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, this._task.idx);
          this._task.showScreen(id.TA_TASK_SCREEN, this._task.idx);
        }
      } else {
        (document.getElementById(id.EXP_BTN) as HTMLDivElement).style[
          "display"
        ] = "none";

        (document.getElementById(id.IDE_CONTAINER) as HTMLDivElement).style[
          "display"
        ] = "none";
        (document.getElementById(id.TASK_CONTAINER) as HTMLDivElement).style[
          "display"
        ] = "block";
        //show task ram and screen
        this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, this._task.idx);
        this._task.showScreen(id.TA_TASK_SCREEN, this._task.idx);
      }
    });

    //button "check"
    btns[6].addEventListener("click", (e) => {
      const comparer = new Comparer(this._options);
      if (
        comparer.compare(
          this._testProg.toUpperCase(),
          (
            document.getElementById(id.TA_CODE) as HTMLInputElement
          ).value.toUpperCase(),
          this._checkHist,
          id.TA_CONSOLE,
          this._visualizer
        )
      ) {
        (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).style[
          "color"
        ] = "green";
        (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).value =
          msg.makeMsg(msg.MESSAGES.UI_CONGRATULATIONS_MSG);

        const oldLevel = window.localStorage.getItem(cnst.LS_LEVEL_ITEM) || 0;
        const newLevel = this._tasks.idx + 1;

        if (newLevel > oldLevel) {
          window.localStorage.setItem(cnst.LS_LEVEL_ITEM, String(newLevel));
        }

        if (this._tasks.idx < this._tasks.text.length - 1) {
          (document.getElementById(id.BTN_NEXT) as HTMLInputElement).style[
            "display"
          ] = "inline-block";
        }
      }
    });
    //
    //button "next"
    btns[7].addEventListener("click", (e) => {
      //if (this._tasks.idx < this._tasks.text.length - 1) {
      this.startGame(this._tasks.idx + 1);
      //}
    });

    for (let i = 0; i < 3; i++) {
      btnsDebugContainer.appendChild(btns[i]);
    }

    for (let i = 5; i < length; i++) {
      btnsContainer.appendChild(btns[i]);
    }

    const optionsContainer = document.createElement("div");
    optionsContainer.id = id.OPTIONS_CONTAINER;
    optionsContainer.className = classes.OPTIONS_CONTAINER;

    const labelTexts = [
      caption.LBL_SIMB_TXT,
      caption.LBL_HEX_TXT,
      caption.LBL_HINTS_TXT,
      caption.LBL_HELP_TXT,
      caption.LBL_PLAY_MUSIC_TXT,
      caption.LBL_SCREEN_TXT,
    ];
    const labels = [];
    const cbxIds = [
      id.LBL_SIMB,
      id.LBL_HEX,
      id.LBL_HINT,
      id.LBL_HELP,
      id.LBL_MUSIC,
      id.LBL_SCREEN,
    ];
    const cbxs = [];
    for (let i = 0; i < cbxIds.length; i++) {
      labels[i] = document.createElement("label");
      labels[i].innerHTML = labelTexts[i];
      labels[i].className = classes.OPTIONS_LBL;

      cbxs[i] = document.createElement("input");
      cbxs[i].type = "checkbox";
      cbxs[i].id = cbxIds[i];
      cbxs[i].className = classes.OPTIONS_CBX;

      const cbxContainer = document.createElement("div");
      cbxContainer.appendChild(labels[i]);
      cbxContainer.appendChild(cbxs[i]);
      optionsContainer.appendChild(cbxContainer);
    }

    const ideContainer = document.createElement("div");
    ideContainer.className = classes.IDE_CONTAINER;
    ideContainer.id = id.IDE_CONTAINER;

    const menuBar = document.createElement("div");
    menuBar.className = classes.MENUBAR;
    menuBar.id = id.MENU;

    const optSaveMOver = () => {
      const lbl = document.getElementById(
        id.MENUBAR_WARN_LBL
      ) as HTMLLabelElement;
      lbl.innerHTML = caption.IDE_RELOADED_TXT;
      lbl.style["color"] = "red";
      lbl.style["display"] = "inline-block";
    };
    const optSaveMOut = () => {
      const lbl = document.getElementById(
        id.MENUBAR_WARN_LBL
      ) as HTMLLabelElement;
      lbl.style["color"] = "black";
      lbl.style["display"] = "none";
    };

    const optionsWarningLbl = document.createElement("label");
    optionsWarningLbl.className = classes.MENUBAR_LBL;
    optionsWarningLbl.id = id.MENUBAR_WARN_LBL;

    //menu bar options button
    const optionsBtn = document.createElement("button");
    optionsBtn.innerHTML = caption.OPTIONS_CAPTION;
    optionsBtn.id = id.OPTIONS_BTN;
    optionsBtn.setAttribute(
      cnst.HELP_STRING_ATTRIBUTE_NAME,
      caption.OPTIONS_BNT_HINT_TXT
    );
    optionsBtn.addEventListener("click", (e) => {
      const btnCaption = (
        document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement
      ).textContent as string;
      //show options menu
      if (btnCaption.charCodeAt(0) === caption.OPTIONS_CAPTION_CODE) {
        (document.getElementById(id.LBL_SIMB) as HTMLInputElement).checked =
          Boolean(this._options[cnst.SIMB_SHOW_IDX]);
        (document.getElementById(id.LBL_HEX) as HTMLInputElement).checked =
          Boolean(this._options[cnst.HEX_SHOW_IDX]);
        (document.getElementById(id.LBL_HINT) as HTMLInputElement).checked =
          Boolean(this._options[cnst.HINTS_SHOW_IDX]);
        (document.getElementById(id.LBL_HELP) as HTMLInputElement).checked =
          Boolean(this._options[cnst.HELP_SHOW_IDX]);
        (document.getElementById(id.LBL_MUSIC) as HTMLInputElement).checked =
          Boolean(this._options[cnst.PLAY_MUSIC_IDX]);
        (document.getElementById(id.LBL_SCREEN) as HTMLInputElement).checked =
          Boolean(this._options[cnst.ONE_SCREEN_IDX]);

        (
          document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement
        ).innerHTML = caption.NO_CAPTION;

        const helpBtn = document.getElementById(
          id.HELP_BTN
        ) as HTMLButtonElement;
        helpBtn.addEventListener("mouseover", optSaveMOver);
        helpBtn.addEventListener("mouseout", optSaveMOut);
        helpBtn.innerHTML = caption.YES_CAPTION;

        (document.getElementById(id.EXP_BTN) as HTMLButtonElement).style[
          "display"
        ] = "none";

        (document.getElementById(id.OPTIONS_CONTAINER) as HTMLDivElement).style[
          "display"
        ] = "flex";

        (
          document.getElementById(id.MAIN_CONTAINER) as HTMLDivElement
        ).classList.add(classes.MAIN_CONTAINER_SHOWED_OPTIONS);

        //disable buttons help strings
        this.changeAllBtnsHelpStrings(0);
      } else {
        //close options menu
        if (btnCaption.charCodeAt(0) === caption.NO_CAPTION_CODE) {
          (
            document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement
          ).innerHTML = caption.OPTIONS_CAPTION;

          const helpBtn = document.getElementById(
            id.HELP_BTN
          ) as HTMLButtonElement;
          helpBtn.removeEventListener("mouseover", optSaveMOver);
          helpBtn.removeEventListener("mouseout", optSaveMOut);
          helpBtn.innerHTML = caption.HELP_CAPTION;

          (document.getElementById(id.EXP_BTN) as HTMLButtonElement).style[
            "display"
          ] = "inline-block";

          (
            document.getElementById(id.OPTIONS_CONTAINER) as HTMLDivElement
          ).style["display"] = "none";

          (
            document.getElementById(id.MAIN_CONTAINER) as HTMLDivElement
          ).classList.remove(classes.MAIN_CONTAINER_SHOWED_OPTIONS);

          //show buttons help strings if variable is truthy
          this.changeAllBtnsHelpStrings(this._options[cnst.HELP_SHOW_IDX]);
        }
      }
    });

    //menu bar help button
    const helpBtn = document.createElement("button");
    helpBtn.innerHTML = caption.HELP_CAPTION;
    helpBtn.id = id.HELP_BTN;
    helpBtn.setAttribute(
      cnst.HELP_STRING_ATTRIBUTE_NAME,
      caption.HELP_BTN_HINT_TXT
    );
    helpBtn.addEventListener("click", () => {
      const btnCaption = (
        document.getElementById(id.HELP_BTN) as HTMLButtonElement
      ).textContent as string;
      //save options data
      if (btnCaption.charCodeAt(0) === caption.YES_CAPTION_CODE) {
        (
          document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement
        ).innerHTML = caption.OPTIONS_CAPTION;

        const helpBtn = document.getElementById(
          id.HELP_BTN
        ) as HTMLButtonElement;
        helpBtn.removeEventListener("mouseover", optSaveMOver);
        helpBtn.removeEventListener("mouseout", optSaveMOut);
        helpBtn.innerHTML = caption.HELP_CAPTION;

        (document.getElementById(id.EXP_BTN) as HTMLButtonElement).style[
          "display"
        ] = "inline-block";

        (document.getElementById(id.OPTIONS_CONTAINER) as HTMLDivElement).style[
          "display"
        ] = "none";

        (
          document.getElementById(id.MAIN_CONTAINER) as HTMLDivElement
        ).classList.remove(classes.MAIN_CONTAINER_SHOWED_OPTIONS);

        this._options[cnst.HEX_SHOW_IDX] = Number(
          (document.getElementById(id.LBL_HEX) as HTMLInputElement).checked
        );
        this._options[cnst.SIMB_SHOW_IDX] = Number(
          (document.getElementById(id.LBL_SIMB) as HTMLInputElement).checked
        );
        this._options[cnst.HINTS_SHOW_IDX] = Number(
          (document.getElementById(id.LBL_HINT) as HTMLInputElement).checked
        );
        this._options[cnst.HELP_SHOW_IDX] = Number(
          (document.getElementById(id.LBL_HELP) as HTMLInputElement).checked
        );
        this._options[cnst.PLAY_MUSIC_IDX] = Number(
          (document.getElementById(id.LBL_MUSIC) as HTMLInputElement).checked
        );
        this._options[cnst.ONE_SCREEN_IDX] = Number(
          (document.getElementById(id.LBL_SCREEN) as HTMLInputElement).checked
        );

        //save changed this._options
        window.localStorage.setItem(
          cnst.LS_OPT_ITEM,
          JSON.stringify(this._options)
        );

        //restarts with new parameters
        this.startGame(this._tasks.idx, true);

        //show buttons help strings if variable is truthy
        this.changeAllBtnsHelpStrings(this._options[cnst.HELP_SHOW_IDX]);
      } else {
        //help
        if (btnCaption === caption.HELP_CAPTION) {
          (document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement).style[
            "display"
          ] = "none";

          (
            document.getElementById(id.HELP_BTN) as HTMLButtonElement
          ).innerHTML = caption.NO_CAPTION;

          (document.getElementById(id.EXP_BTN) as HTMLButtonElement).style[
            "display"
          ] = "none";

          (document.getElementById(id.HELP_SCREEN) as HTMLDivElement).style[
            "display"
          ] = "block";

          const ideContainer = document.getElementById(
            id.IDE_CONTAINER
          ) as HTMLDivElement;
          ideContainer.setAttribute(
            cnst.DISPLAY_ATTRIBUTE_NAME,
            ideContainer.style["display"]
          );
          ideContainer.style["display"] = "none";

          const taskContainer = document.getElementById(
            id.TASK_CONTAINER
          ) as HTMLDivElement;
          taskContainer.setAttribute(
            cnst.DISPLAY_ATTRIBUTE_NAME,
            taskContainer.style["display"]
          );
          taskContainer.style["display"] = "none";

          //disable buttons help strings
          this.changeAllBtnsHelpStrings(0);
        } else {
          //close help screen
          if (btnCaption.charCodeAt(0) === caption.NO_CAPTION_CODE) {
            (
              document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement
            ).style["display"] = "inline-block";

            (
              document.getElementById(id.HELP_BTN) as HTMLButtonElement
            ).innerHTML = caption.HELP_CAPTION;

            (document.getElementById(id.EXP_BTN) as HTMLButtonElement).style[
              "display"
            ] = "inline-block";

            (document.getElementById(id.HELP_SCREEN) as HTMLDivElement).style[
              "display"
            ] = "none";

            (document.getElementById(id.IDE_CONTAINER) as HTMLDivElement).style[
              "display"
            ] = "block";

            const ideContainer = document.getElementById(
              id.IDE_CONTAINER
            ) as HTMLDivElement;
            ideContainer.style["display"] = ideContainer.getAttribute(
              cnst.DISPLAY_ATTRIBUTE_NAME
            ) as string;

            const taskContainer = document.getElementById(
              id.TASK_CONTAINER
            ) as HTMLDivElement;
            taskContainer.style["display"] = taskContainer.getAttribute(
              cnst.DISPLAY_ATTRIBUTE_NAME
            ) as string;

            //show buttons help strings if variable is truthy
            this.changeAllBtnsHelpStrings(this._options[cnst.HELP_SHOW_IDX]);

            (
              document.getElementById(id.HELP_PAGE) as HTMLIFrameElement
            ).addEventListener("load", () => {
              history.pushState(null, "", null);
            });
            (document.getElementById(id.HELP_PAGE) as HTMLIFrameElement).src =
              cnst.HELP_PAGE_SRC;
          }
        }
      }
    });

    //menu bar export user level button
    const expBtn = document.createElement("button");
    expBtn.innerHTML = caption.EXP_CAPTION;
    expBtn.id = id.EXP_BTN;
    expBtn.setAttribute(
      cnst.HELP_STRING_ATTRIBUTE_NAME,
      caption.EXP_BTN_HINT_TXT
    );

    //button "export user level"
    expBtn.addEventListener("click", () => {
      const btnCaption = (
        document.getElementById(id.EXP_BTN) as HTMLButtonElement
      ).textContent as string;
      //close export screen
      if (btnCaption.charCodeAt(0) === caption.YES_CAPTION_CODE) {
        const userTaskList: TaskList = {
          text: [
            {
              name: (
                document.getElementById(id.EXP_TASK_NAME) as HTMLInputElement
              ).value,
              codeHint: (
                document.getElementById(
                  id.TA_EXP_CODE_HINT
                ) as HTMLTextAreaElement
              ).value,
              testProg: (
                document.getElementById(id.TA_CODE) as HTMLTextAreaElement
              ).value,
              testHist: (
                document.getElementById(id.TA_INPUT) as HTMLTextAreaElement
              ).value,
              checkHist: (
                document.getElementById(id.TA_INPUT) as HTMLTextAreaElement
              ).value,
            },
          ],
          idx: 0,
        };

        const userTaskBase64 = `${cnst.ABSOLUTE_PATH}${cnst.REPO_NAME}/${btoa(
          JSON.stringify(userTaskList)
        )}`;

        navigator.clipboard.writeText(userTaskBase64).then(() => {
          (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).style[
            "color"
          ] = "green";
          (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).value =
            msg.makeMsg(msg.MESSAGES.UI_LINK_IN_THE_CLIPBOARD);
        });

        (document.getElementById(id.EXP_BTN) as HTMLButtonElement).innerHTML =
          caption.EXP_CAPTION;

        (document.getElementById(id.HELP_BTN) as HTMLButtonElement).style[
          "display"
        ] = "inline-block";

        (document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement).style[
          "display"
        ] = "inline-block";

        (document.getElementById(id.EXP_CONTAINER) as HTMLDivElement).style[
          "display"
        ] = "none";

        const ideContainer = document.getElementById(
          id.IDE_CONTAINER
        ) as HTMLDivElement;
        ideContainer.style["display"] = ideContainer.getAttribute(
          cnst.DISPLAY_ATTRIBUTE_NAME
        ) as string;

        const taskContainer = document.getElementById(
          id.TASK_CONTAINER
        ) as HTMLDivElement;
        taskContainer.style["display"] = taskContainer.getAttribute(
          cnst.DISPLAY_ATTRIBUTE_NAME
        ) as string;

        //show buttons help strings if variable is truthy
        this.changeAllBtnsHelpStrings(this._options[cnst.HELP_SHOW_IDX]);
      } else {
        (document.getElementById("btnReset") as HTMLButtonElement).click();
        try {
          const programRunner = new ProgramRunner(
            (
              document.getElementById(id.TA_CODE) as HTMLInputElement
            ).value.toUpperCase(),
            this._visualizer.getInputHistory(id.TA_INPUT, null),
            id.TA_CONSOLE
          );
          programRunner.run();
        } catch (e) {
          if (
            (e as Error).message === msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG)
          ) {
            //show export screen
            (
              document.getElementById(id.EXP_BTN) as HTMLButtonElement
            ).innerHTML = caption.YES_CAPTION;

            (document.getElementById(id.HELP_BTN) as HTMLButtonElement).style[
              "display"
            ] = "none";

            (
              document.getElementById(id.OPTIONS_BTN) as HTMLButtonElement
            ).style["display"] = "none";

            (document.getElementById(id.EXP_CONTAINER) as HTMLDivElement).style[
              "display"
            ] = "block";

            (
              document.getElementById(
                id.TA_EXP_CODE_HINT
              ) as HTMLTextAreaElement
            ).value = (
              document.getElementById(id.TA_CODE) as HTMLTextAreaElement
            ).value;

            const ideContainer = document.getElementById(
              id.IDE_CONTAINER
            ) as HTMLDivElement;
            ideContainer.setAttribute(
              cnst.DISPLAY_ATTRIBUTE_NAME,
              ideContainer.style["display"]
            );
            ideContainer.style["display"] = "none";

            const taskContainer = document.getElementById(
              id.TASK_CONTAINER
            ) as HTMLDivElement;
            taskContainer.setAttribute(
              cnst.DISPLAY_ATTRIBUTE_NAME,
              taskContainer.style["display"]
            );
            taskContainer.style["display"] = "none";

            //disable buttons help strings
            this.changeAllBtnsHelpStrings(0);
          } else {
            (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).style[
              "color"
            ] = "red";
            (document.getElementById(id.TA_CONSOLE) as HTMLInputElement).value =
              (e as Error).message.toLowerCase();
          }
        }
      }
    });

    optionsBtn.className =
      helpBtn.className =
      expBtn.className =
        classes.MENU_BTN;

    menuBar.appendChild(optionsWarningLbl);
    menuBar.appendChild(expBtn);
    menuBar.appendChild(helpBtn);
    menuBar.appendChild(optionsBtn);

    const helpPage = document.createElement("iframe");
    helpPage.id = id.HELP_PAGE;
    helpPage.className = classes.HELP_PAGE_MAIN;
    /* eslint-disable no-undef */
    helpPage.onload = function () {
      (
        (document.getElementById(id.HELP_PAGE) as HTMLIFrameElement)
          .contentWindow as WindowProxy
      ).document.body.style["color"] = "green";
    };
    /* eslint-enable */
    helpPage.src = cnst.HELP_PAGE_SRC;

    const helpScreen = document.createElement("div");
    helpScreen.id = id.HELP_SCREEN;
    helpScreen.className = classes.HELP_SCREEN_MAIN;
    helpScreen.appendChild(helpPage);

    mainDiv.appendChild(helpScreen);
    mainDiv.appendChild(menuBar);
    mainDiv.appendChild(optionsContainer);

    let taContainer1 = document.createElement("div");
    taContainer1.className = classes.TA_CONTAINER;

    let taContainer2 = document.createElement("div");
    taContainer2.className = classes.TA_CONTAINER;

    if (window.screen.availWidth > cnst.MIN_WIDE_SCREEN_WIDTH) {
      taContainer1.appendChild(btns[3]);
      taContainer1.appendChild(textareas[1]);
      taContainer1.appendChild(textareas[2]);
      taContainer1.appendChild(textareas[0]);
      taContainer1.appendChild(btnsDebugContainer);
      taContainer1.appendChild(btnsContainer);

      taContainer2.appendChild(btns[4]);
      taContainer2.appendChild(textareas[3]);
      taContainer2.appendChild(textareas[4]);

      ideContainer.appendChild(taContainer1);
      ideContainer.appendChild(taContainer2);
    } else {
      taContainer1.className = classes.TA_CONTAINER;
      taContainer1.appendChild(btns[3]);
      taContainer1.appendChild(textareas[1]);
      taContainer1.appendChild(textareas[2]);
      taContainer1.appendChild(textareas[0]);
      taContainer1.appendChild(btnsDebugContainer);
      taContainer1.appendChild(btnsContainer);
      taContainer1.style["width"] = "100%";

      taContainer2.appendChild(textareas[3]);
      taContainer2.appendChild(textareas[4]);
      taContainer2.style["width"] = "100%";

      ideContainer.appendChild(taContainer1);
      ideContainer.appendChild(taContainer2);
      ideContainer.appendChild(btns[4]);
    }

    mainDiv.appendChild(ideContainer);

    //set "textarea" div width and height
    textareas[2].style["width"] = textareas[1].clientWidth + 2 + "px";
    textareas[2].style["height"] = textareas[1].clientHeight + 2 + "px";

    const taskTareaIDs = [id.TA_TASK_RAM, id.TA_TASK_SCREEN];
    const taskTextareas = [];
    length = taskTareaIDs.length;

    for (let i = 0; i < length; i++) {
      if (i) {
        taskTextareas[i] = document.createElement("textarea");
        (taskTextareas[i] as HTMLTextAreaElement).cols = cols;
        taskTextareas[i].className = classes.TA_TASK_MAIN;
        (taskTextareas[i] as HTMLTextAreaElement).readOnly = true;
      }
      //task ram "textarea"
      else {
        taskTextareas[i] = document.createElement("div");
        taskTextareas[i].className = classes.TA_TASK_RAM;
      }
      taskTextareas[i].id = taskTareaIDs[i];
      taskTextareas[i].tabIndex = -1;
    }
    (taskTextareas[0] as HTMLTextAreaElement).rows = rows2;
    (taskTextareas[1] as HTMLTextAreaElement).rows = rows1;

    const taskBtnsContainer = document.createElement("div");
    taskBtnsContainer.className = classes.TASK_BTNS_CONTAINER_MAIN;
    taskBtnsContainer.id = id.TASK_BTNS_CONTAINER;

    const taskBtnNames = [
      caption.BTN_FIRST_CAPTION,
      caption.BTN_TASK_PLAY_PREV_CAPTION,
      caption.BTN_TASK_PREV_CAPTION,
      caption.BTN_TASK_NEXT_CAPTION,
      caption.BTN_TASK_PLAY_NEXT_CAPTION,
      caption.BTN_LAST_CAPTION,
      caption.BTN_RESTART_CAPTION,
      caption.BTN_CLOSE_CAPTION,
    ];
    const taskBtnIDs = [
      id.BTN_FIRST,
      id.BTN_TASK_PLAY_PREV,
      id.BTN_TASK_PREV,
      id.BTN_TASK_NEXT,
      id.BTN_TASK_PLAY_NEXT,
      id.BTN_LAST,
      id.BTN_RESTART,
      id.BTN_CLOSE,
    ];
    const taskBtnHelp = [
      caption.BTN_FIRST_HELP,
      caption.BTN_TASK_PLAY_PREV_HELP,
      caption.BTN_TASK_PREV_HELP,
      caption.BTN_TASK_NEXT_HELP,
      caption.BTN_TASK_PLAY_NEXT_HELP,
      caption.BTN_LAST_HELP,
      caption.BTN_RESTART_HELP,
      caption.BTN_CLOSE_HELP,
    ];
    const taskBtns = [];

    length = taskBtnNames.length;
    for (let i = 0; i < length; i++) {
      taskBtns[i] = document.createElement("button");
      taskBtns[i].innerHTML = taskBtnNames[i];
      taskBtns[i].id = taskBtnIDs[i];
      taskBtns[i].className = classes.TASK_BTNS_MAIN;
      taskBtns[i].setAttribute(cnst.HELP_STRING_ATTRIBUTE_NAME, taskBtnHelp[i]);
    }

    //button first
    taskBtns[0].addEventListener("click", (e) => {
      this._task.setIdx(0);
      this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, 0);
      this._task.showScreen(id.TA_TASK_SCREEN, 0);
    });

    //button play prev
    taskBtns[1].addEventListener("click", (e) => {
      const last = this._task.historySize;
      const hIdx = this._task.idx;
      let idx;
      for (idx = hIdx - 1; idx >= 0; idx--) {
        if (
          idx < last - 1 &&
          this._task.getRamElement(idx) !== this._task.getRamElement(idx + 1)
        ) {
          break;
        }
      }
      idx < 0 && (idx = 0);
      this._task.setIdx(idx);
      this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, idx);
      this._task.showScreen(id.TA_TASK_SCREEN, idx);
    });

    //button "prev"
    taskBtns[2].addEventListener("click", (e) => {
      const hIdx = this._task.decrementIdx();
      this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, hIdx);
      this._task.showScreen(id.TA_TASK_SCREEN, hIdx);
    });

    //button "next"
    taskBtns[3].addEventListener("click", (e) => {
      const hIdx = this._task.incrementIdx();
      this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, hIdx);
      this._task.showScreen(id.TA_TASK_SCREEN, hIdx);
    });

    //button play next
    taskBtns[4].addEventListener("click", (e) => {
      const last = this._task.historySize;
      const hIdx = this._task.idx;
      let idx;
      for (idx = hIdx + 1; idx < last; idx++) {
        if (
          idx &&
          this._task.getRamElement(idx) !== this._task.getRamElement(idx - 1)
        ) {
          break;
        }
      }
      idx > last - 1 && (idx = last - 1);
      this._task.setIdx(idx);
      this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, idx);
      this._task.showScreen(id.TA_TASK_SCREEN, idx);
    });

    //button last
    taskBtns[5].addEventListener("click", (e) => {
      const idx = this._task.historySize - 1;
      this._task.setIdx(idx);
      this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, idx);
      this._task.showScreen(id.TA_TASK_SCREEN, idx);
    });

    //button "restart"
    taskBtns[6].addEventListener("click", (e) => {
      //creating new task (global variable)
      this._task = new Task(
        this._testProg.toUpperCase(),
        this._testHist,
        null,
        this._options
      );
      this._task.showRam(id.TA_TASK_RAM, id.TASK_LBL, this._task.idx);
      this._task.showScreen(id.TA_TASK_SCREEN, this._task.idx);
    });

    //button "close"
    taskBtns[7].addEventListener("click", (e) => {
      (document.getElementById(id.TASK_CONTAINER) as HTMLDivElement).style[
        "display"
      ] = "none";
      (document.getElementById(id.IDE_CONTAINER) as HTMLDivElement).style[
        "display"
      ] = "block";

      (document.getElementById(id.EXP_BTN) as HTMLDivElement).style["display"] =
        "inline-block";
    });

    for (let i = 0; i < length - 1; i++) {
      taskBtnsContainer.appendChild(taskBtns[i]);
    }

    const taskContainer = document.createElement("div");
    taskContainer.className = classes.TASK_CONTAINER_MAIN;
    taskContainer.id = id.TASK_CONTAINER;

    const taskLabel = document.createElement("label");
    taskLabel.className = classes.TASK_LBL_MAIN;
    taskLabel.id = id.TASK_LBL;

    taContainer1 = document.createElement("div");
    taContainer1.className = classes.TA_TASK_CONTAINER_MAIN;

    taContainer2 = document.createElement("div");
    taContainer2.className = classes.TA_TASK_CONTAINER_MAIN;

    if (window.screen.availWidth > cnst.MIN_WIDE_SCREEN_WIDTH) {
      if (this._options[cnst.ONE_SCREEN_IDX]) {
        taContainer1.classList.add(classes.TA_TASK_CONTAINER_LEFT_SINGLESCREEN);
        taContainer1.appendChild(taskLabel);
        taContainer1.appendChild(taskBtnsContainer);
        taContainer1.appendChild(taskTextareas[0]);

        taContainer2.appendChild(taskTextareas[1]);
        taskContainer.appendChild(taContainer1);
        taskContainer.appendChild(taContainer2);
      } else {
        taContainer1.classList.add(classes.TA_TASK_CONTAINER_LEFT);
        taContainer1.appendChild(taskLabel);
        taContainer1.appendChild(taskTextareas[0]);
        taContainer1.appendChild(taskBtnsContainer);
        taContainer1.appendChild(taskBtns[length - 1]);

        taContainer2.appendChild(taskTextareas[1]);

        taskContainer.appendChild(taContainer1);
        taskContainer.appendChild(taContainer2);
      }
    } else {
      taContainer1.classList.add(classes.TA_TASK_CONTAINER_LEFT);
      taContainer1.appendChild(taskLabel);
      taContainer1.appendChild(taskTextareas[0]);
      taContainer1.appendChild(taskBtnsContainer);
      taContainer1.style["width"] = "100%";

      taContainer2.appendChild(taskTextareas[1]);
      taContainer2.style["width"] = "100%";

      taskContainer.appendChild(taContainer1);
      taskContainer.appendChild(taContainer2);
      taskContainer.appendChild(taskBtns[length - 1]);
    }

    this._options[cnst.HINTS_SHOW_IDX] &&
      ((document.getElementById(id.TA_CODE) as HTMLTextAreaElement).value =
        codeStr);
    (document.getElementById(id.MAIN_CONTAINER) as HTMLDivElement).appendChild(
      taskContainer
    );

    const expContainer = document.createElement("div");
    expContainer.className = classes.TA_CONTAINER;
    expContainer.id = id.EXP_CONTAINER;
    expContainer.style["width"] = "100%";
    expContainer.style["display"] = "none";
    expContainer.style["padding-top" as unknown as number] = "0.7rem";

    const expCodeHintLabel = document.createElement("label");
    expCodeHintLabel.className = classes.TASK_LBL_MAIN;
    expCodeHintLabel.innerHTML = caption.EXP_CODE_HINT_LBL;

    const taExpCodeHint = document.createElement("textarea");
    taExpCodeHint.cols = cols;
    taExpCodeHint.className = classes.TA_MAIN;

    taExpCodeHint.id = id.TA_EXP_CODE_HINT;
    taExpCodeHint.rows = rows2;
    taExpCodeHint.style["display"] = "block";
    taExpCodeHint.style["margin-bottom" as unknown as number] = "0.4rem";
    taExpCodeHint.style["padding-top" as unknown as number] = "0.15rem";

    const expTaskNameLabel = document.createElement("label");
    expTaskNameLabel.className = classes.TASK_LBL_MAIN;
    expTaskNameLabel.innerHTML = caption.EXP_TASK_NAME_LBL;

    const expTaskNameInput = document.createElement("input");
    expTaskNameInput.type = "text";
    expTaskNameInput.size = cols;
    expTaskNameInput.className = classes.TA_MAIN;
    expTaskNameInput.id = id.EXP_TASK_NAME;
    expTaskNameInput.value = "USER LEVEL";
    expTaskNameInput.style["display"] = "block";

    expTaskNameInput.addEventListener("input", (e: Event) => {
      let name = (e.currentTarget as HTMLInputElement).value;
      name.length > 20 && (name = name.slice(0, 20));
      (e.currentTarget as HTMLInputElement).value = name;
    });

    expContainer.appendChild(expCodeHintLabel);
    expContainer.appendChild(taExpCodeHint);
    expContainer.appendChild(expTaskNameLabel);
    expContainer.appendChild(expTaskNameInput);

    (document.getElementById(id.MAIN_CONTAINER) as HTMLDivElement).appendChild(
      expContainer
    );

    this.changeAllBtnsHelpStrings(this._options[cnst.HELP_SHOW_IDX]);

    //set task "textarea" div width and height
    taskTextareas[0].style["width"] = textareas[2].style["width"];
    taskTextareas[0].style["height"] = textareas[2].style["height"];

    if (this._musicPlayer) {
      this._options[cnst.PLAY_MUSIC_IDX]
        ? this._musicPlayer.play()
        : this._musicPlayer.pause();
    } else {
      this._musicPlayer = new Audio(cnst.BG_MUSIC_SRC);
      this._musicPlayer.loop = true;
      this._musicPlayer.addEventListener("canplay", (e: Event) => {
        this._options[cnst.PLAY_MUSIC_IDX]
          ? (this._musicPlayer as HTMLAudioElement).play()
          : (this._musicPlayer as HTMLAudioElement).pause();
      });
    }
  }

  get musicPlayer() {
    return this._musicPlayer;
  }
}
