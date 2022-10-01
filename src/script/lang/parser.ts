import * as msg from "../consts/messages";
import { Environment } from "./environment";
import { Command } from "./command";

//the parser for command line
export class Parser {
  //parse one string
  parse(str: string, env: Environment) {
    str = str.trim();

    //space-divided command
    const splittedStr = str.split(" ");

    //switch command of reserved words
    const command = splittedStr[1];

    //comment
    //if empty string or only line number or comment
    if (command === "REM" || !str || /^[0-9]+$/.test(str)) {
      return null;
    }

    let trimmedStr: string | string[] = splittedStr.slice(2).join(" ").trim();

    //end of program
    if (command === "END") {
      trimmedStr.length && msg.throwError(env.lp, msg.MESSAGES.CMD_END_ERR);
      return new Command("END", null, null);
    }

    //new variable
    if (command === "LET") {
      trimmedStr = trimmedStr.split("=");
      trimmedStr.length > 2 && msg.throwError(env.lp, msg.MESSAGES.CMD_LET_ERR);
      //if expression not present use default value
      return new Command("LET", trimmedStr[0], trimmedStr[1] || null);
    }

    //new array
    if (command === "DIM") {
      !/\(.+\)/.test(trimmedStr) &&
        msg.throwError(env.lp, msg.MESSAGES.CMD_DIM_ERR);
      return new Command("DIM", trimmedStr, null);
    }

    //if
    if (command === "IF") {
      trimmedStr = trimmedStr.split("THEN");
      //error: no THEN
      trimmedStr.length === 1 &&
        msg.throwError(env.lp, msg.MESSAGES.CMD_IF_ERR);
      //nested IF's are prohibited
      trimmedStr.length > 2 &&
        msg.throwError(env.lp, msg.MESSAGES.CMD_MANY_THEN_ERR);
      return new Command("IF", trimmedStr[1], trimmedStr[0]);
    }

    //input
    if (command === "INPUT") {
      return new Command("INPUT", trimmedStr, null);
    }

    //goto / gosub
    if (command === "GOTO" || command === "GOSUB") {
      return new Command(command, null, trimmedStr);
    }

    //return / println
    if (command === "RETURN" || command === "PRINTLN" || command === "PRINT") {
      return new Command(
        command,
        null,
        trimmedStr.length !== 0 ? trimmedStr : null
      );
    }

    //variable =

    trimmedStr = (command + trimmedStr).split("=");
    trimmedStr.length === 1 &&
      msg.throwError(env.lp, msg.MESSAGES.CMD_VAR_OMIT_ERR);
    trimmedStr.length > 2 &&
      msg.throwError(env.lp, msg.MESSAGES.CMD_VAR_MANY_ERR);
    return new Command("=", trimmedStr[0], trimmedStr[1]);
  }
}
