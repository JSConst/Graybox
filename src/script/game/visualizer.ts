import { ReturnPointer } from "../lang/rPointer";
import { InputHistory } from "../lang/iHistory";
import { Variable } from "../lang/variable";

export class Visualizer {
  private savedRamState: string | null;

  constructor() {
    this.savedRamState = null;
  }

  showNeedTextArea(textareas: string[], num: number) {
    const textareaEls = textareas.map((el) => {
      return document.getElementById(el);
    });

    const length = textareaEls.length;
    for (let i = 0; i < length; i++) {
      i !== num && ((textareaEls[i] as HTMLElement).style["display"] = "none");
    }
    (textareaEls[num] as HTMLElement).style["display"] = "block";
  }

  showRam(
    taName: string | null,
    vars: { [index: string]: Variable } | null,
    stack: { [index: string]: ReturnPointer } | null,
    ramSize: number,
    simb: number,
    hex: number
  ) {
    const cellToStr = (
      num: number,
      simb: number,
      hex: number,
      pref: string,
      suf: string
    ): string => {
      pref.length === 0 && (pref = " ");
      suf.length === 0 && (suf = " ");
      let str = "";
      if (simb) {
        str = '"' + String.fromCharCode(num) + '"';
      } else {
        if (hex) {
          suf += " ";
          num &= 0xff;
          str = num.toString(16);
          str.length < 2 && (str = "0" + str);
        } else {
          str = num.toString();
          if (num < 0) {
            str = str.substring(1);
            str.length < 2 && (str = "00" + str);
            str.length < 3 && (str = "0" + str);
            pref = "-";
          } else {
            str.length < 2 && (str = "00" + str);
            str.length < 3 && (str = "0" + str);
          }
        }
      }
      return pref + str + suf;
    };

    const ram = new Array<string>(ramSize);
    for (let i = 0; i < ram.length; i++) {
      ram[i] = cellToStr(0, 0, hex, "", "");
    }

    for (const el in vars) {
      const val = vars[el].value;
      if (vars[el].type) {
        for (let i = 0; i < (val as string).length; i++) {
          ram[vars[el].address + i] = cellToStr(
            (val as string).charCodeAt(i),
            simb,
            hex,
            "",
            ""
          );
        }
      } else {
        ram[vars[el].address] = cellToStr(
          Number(val as number),
          0,
          hex,
          "",
          ""
        );
      }
    }

    for (const el in stack) {
      const val = Number(stack[el].value);
      ram[stack[el].address] = cellToStr(Number(val & 0xff), 0, hex, "", "");
      ram[stack[el].address + 1] = cellToStr(Number(val >>> 8), 0, hex, "", "");
    }

    let str = "";
    for (let i = 0, j = 0; i < ram.length; i++, j++) {
      i !== 0 && !(j & 0x0f) && (str += "\n");
      str += ram[i];
    }

    //reset saved ram state
    !vars && !stack && (this.savedRamState = str.toLowerCase());

    const textarea = taName === null ? null : document.getElementById(taName);
    //(textarea) && (textarea.value = str.toLowerCase());
    textarea && (textarea.innerHTML = `<pre>${str.toLowerCase()}</pre>`);
    return str.toLowerCase();
  }

  changeShowedRamState(taName: string) {
    const ta = document.getElementById(taName) as HTMLElement;
    if (this.savedRamState) {
      const newState = this.ramVisualizationModify(
        this.savedRamState,
        ta.textContent as string
      );
      this.savedRamState = ta.textContent;
      ta.innerHTML = `<pre>${newState}</pre>`;
    } else {
      this.savedRamState = ta.textContent;
    }
  }

  showScreen(
    taName: string | null,
    screen: { [index: string]: string } | null,
    lastScreenLine: number,
    rows: number
  ) {
    let str = "";
    if (screen !== null) {
      const start = lastScreenLine > rows ? lastScreenLine - rows : 0;
      for (let i = start; i <= lastScreenLine; i++) {
        str += String(i) in screen ? `${screen[String(i)]}\n` : "\n";
      }
    }

    //change simbol for inputs
    str = str.split("\x02").join("<");

    const textarea = document.getElementById(
      taName as string
    ) as HTMLTextAreaElement;
    textarea && (textarea.value = str.toLowerCase());
    return str.toLowerCase();
  }

  getInputHistory(
    taName: string | null,
    str: string | string[] | null
  ): InputHistory {
    if (taName !== null) {
      const textarea = document.getElementById(taName) as HTMLTextAreaElement;
      str = textarea.value;
    }

    const inputHist = new InputHistory();
    let jsCode = "";
    let jsCodeFlag = 0;
    let jsCodeLine = 0;
    let linesCount = 0;
    //if (str.length)
    {
      str = (str as string).split("\n");
      str.forEach((el) => {
        linesCount++;
        el = el.trim();
        if (!el) {
          return;
        }

        const esc = el
          .split(" ")
          .map((el) => {
            return el.trim();
          })
          .filter((el) => {
            return el.length ? true : false;
          })
          .join("_")
          .trim()
          .toUpperCase();

        if (esc === "JS_CODE_START" && !jsCodeFlag) {
          jsCodeFlag = 1;
          jsCodeLine = linesCount;
        } else {
          if (esc === "JS_CODE_END" && jsCodeFlag) {
            try {
              if (!jsCode.trim().length) {
                return;
              }
              const result = eval(jsCode) as string[];
              result.forEach((rslt) => {
                inputHist.addInputHistoryElement(String(eval(rslt)));
              });
            } catch {
              throw new Error(
                `INPUT DATA: BAD JS CODE STARTED AT LINE ${jsCodeLine}`
              );
            }
          } else {
            //javascript expressions
            if (jsCodeFlag) {
              jsCode += `${el}\n`;
            } else {
              try {
                if (!el.trim().length) {
                  return;
                }
                eval(el);
              } catch {
                throw new Error(
                  `INPUT DATA: BAD ONE-STRING JS CODE STARTED AT LINE ${linesCount}`
                );
              }
              //strings, numbers and one-line JS commands
              inputHist.addInputHistoryElement(`${el}`);
            }
          }
        }
      });
    }
    return inputHist;
  }

  ramVisualizationModify(
    oldState: string | string[],
    newState: string | string[]
  ): string {
    oldState = (oldState as string).trim().split("\n");
    newState = (newState as string).trim().split("\n");

    const stateLength = oldState.length;
    for (let i = 0; i < stateLength; i++) {
      let oldLine: string | string[] = oldState[i]
        .split(' " " ')
        .join(' "\x00" ');
      let newLine: string | string[] = newState[i]
        .split(' " " ')
        .join(' "\x00" ');

      oldLine = oldLine.split("   ").join(" ");
      newLine = newLine.split("   ").join(" ");

      oldLine = oldLine.split("  ").join(" ");
      newLine = newLine.split("  ").join(" ");

      oldLine = oldLine.split(" ");
      newLine = newLine.split(" ");
      const lineLength = oldLine.length;
      for (let j = 0; j < lineLength; j++) {
        let space = " ";
        newLine[j][0] === "-" && (space = "");
        if (oldLine[j] !== newLine[j]) {
          newLine[j] =
            newLine[j].length < 3
              ? `<span style="color:red">${space}${newLine[j]}</span>  `
              : `<span style="color:red">${space}${newLine[j]} </span>`;
        } else {
          newLine[j] = newLine[j].trim().length
            ? newLine[j].length < 3
              ? `${space}${newLine[j]}  `
              : `${space}${newLine[j]} `
            : "";
        }
      }
      newState[i] = newLine.join("");
      newState[i] = newState[i].split("\x00").join(" ");
    }
    return newState.join("\n");
  }
}
