import * as msg from "../consts/messages";
import { Environment } from "./environment";
import { ExpressionResult } from "./eResult";
import { Variable } from "./variable";
import { Command } from "./command";
import { Parser } from "./parser";

//the command processor
export class Executor {
  replaceOp(
    str: string,
    first: string,
    second: string,
    oddEven: number
  ): string {
    //all first's are changing for second, but not in quotes
    let isEven = oddEven;
    return str
      .split('"')
      .map((el) => {
        isEven ^= 1;
        if (isEven) {
          return el.split(first).join(second);
        } else {
          return el;
        }
      })
      .join('"');
  }

  changeHex(str: string): string {
    //all HEX's are changing for second, but not in quotes
    let isEven = 0;
    return str
      .split('"')
      .map((el) => {
        isEven ^= 1;
        if (isEven) {
          let rslt: string[] | null = [];
          //find all $H[LETTER] and changing it with 0x[letter]
          while ((rslt = /&H[0-9A-F]+/.exec(el)) !== null) {
            rslt.forEach((hex) => {
              el = el.replace(hex, "0x" + hex.slice(2).toLowerCase());
            });
          }
          return el;
        } else {
          return el;
        }
      })
      .join('"');
  }

  calcExpression(
    expression: string,
    logic: number,
    print: number,
    env: Environment
  ): ExpressionResult {
    expression = expression.trim();

    //all Basic's hex numbers are changin for JS format and eval work properly
    expression = this.changeHex(expression);
    //all "NOT" changing for "!" / "~" and eval work properly
    expression = this.replaceOp(expression, "NOT", logic ? "!" : "~", 0);
    //all "AND" changing for "&&" / "&" and eval work properly
    expression = this.replaceOp(expression, "AND", logic ? "&&" : "&", 0);
    //all "XOR" changing for "^" and eval work properly
    let logicalXorFlag = expression;
    expression = this.replaceOp(expression, "XOR", "^", 0);
    if (logic) {
      logicalXorFlag === expression && (logicalXorFlag = "");
    } else {
      logicalXorFlag = "";
    }
    //all "OR" changing for "||" / "|" and eval work properly
    expression = this.replaceOp(expression, "OR", logic ? "||" : "|", 0);

    //all brackets in the strings (between the quotes) changing for #0x03, #04 codes
    expression = this.replaceOp(expression, "(", "\x03", 1);
    expression = this.replaceOp(expression, ")", "\x04", 1);

    let splittedExpr: string[] = expression.split("");

    let count = 0;
    splittedExpr.forEach((el) => {
      if (el === ")" || el === "(") {
        count++;
      }
    });

    //deleting start/end brackets if need
    count === 2 &&
      splittedExpr[0] === "(" &&
      splittedExpr[splittedExpr.length - 1] === ")" &&
      (splittedExpr = splittedExpr.slice(1, splittedExpr.length - 1)) &&
      (expression = expression.slice(1, expression.length - 1));

    //check that all brackets are pair
    let isBracketsArePair = 0;
    splittedExpr.forEach((el) => {
      isBracketsArePair += el === "(" ? 1 : el === ")" ? -1 : 0;
    });
    isBracketsArePair && msg.throwError(env.lp, msg.MESSAGES.EXE_BRACKETS_ERR);

    let isResultString = 0;
    //find brackets and recusrively calculate it's content
    while (true) {
      let length = splittedExpr.length;

      //finding inner brackets
      for (let i = 0; i < length; i++) {
        if (splittedExpr[i] === ")") {
          for (let j = i; j--; ) {
            if (splittedExpr[j] === "(") {
              const tmpExpr = this.calcExpression(
                splittedExpr
                  .slice(j, i + 1)
                  .join("")
                  .trim(),
                logic,
                print,
                env
              );
              let rslt = String(tmpExpr.rslt);
              if (tmpExpr.type === 1) {
                isResultString = 1;
                rslt = `'${rslt}'`;
              }
              splittedExpr = splittedExpr
                .slice(0, j)
                .concat(rslt)
                .concat(splittedExpr.slice(i + 1, length));
              length = splittedExpr.length;
              i = -1;
              break;
            }
          }
        }
      }
      break;
    }

    expression = splittedExpr.join("");

    //all #0x03, #04 codes are changing for brackets
    expression = this.replaceOp(expression, "\x03", "(", 1);
    expression = this.replaceOp(expression, "\x04", ")", 1);

    //changing ">=" and "<=" for properly changing
    expression = this.replaceOp(expression, ">=", "\x00", 0);
    expression = this.replaceOp(expression, "<=", "\x01", 0);

    //all "=" changing for "==" and eval work properly
    expression = this.replaceOp(expression, "=", "===", 0);
    //all "<>" changing for "!=" and eval work properly
    expression = this.replaceOp(expression, "<>", "!==", 0);

    //changing "x00' AND "x01" for ">=" and "<="
    expression = this.replaceOp(expression, "\x00", ">=", 0);
    expression = this.replaceOp(expression, "\x01", "<=", 0);

    let quotesFlag = 0;
    const exprNoQuotes = [];
    //delete quotes content and check that all quotes are pair
    for (let i = 0; i < splittedExpr.length; i++) {
      splittedExpr[i] === '"' && (quotesFlag ^= 0x01);
      splittedExpr[i] !== '"' &&
        !quotesFlag &&
        exprNoQuotes.push(splittedExpr[i]);
    }
    quotesFlag && msg.throwError(env.lp, msg.MESSAGES.EXE_QUOTES_ERR);
    splittedExpr.length !== exprNoQuotes.length && (isResultString = 1);

    //find array elements
    for (let i = 1; i < exprNoQuotes.length; i++) {
      //find all numbers after letter or $
      if (
        typeof exprNoQuotes[i] === "number" &&
        (exprNoQuotes[i - 1].indexOf("$") >= 0 ||
          (exprNoQuotes[i - 1] >= "A" && exprNoQuotes[i - 1] <= "Z"))
      ) {
        exprNoQuotes[i - 1] += exprNoQuotes[i];
        exprNoQuotes[i] = "";
      }
      //find all string numbers after letter or $
      if (
        /[0-9]/.test(exprNoQuotes[i]) &&
        (exprNoQuotes[i - 1].indexOf("$") >= 0 ||
          (exprNoQuotes[i - 1] >= "A" && exprNoQuotes[i - 1] <= "Z"))
      ) {
        exprNoQuotes[i - 1] += exprNoQuotes[i];
        exprNoQuotes[i] = "";
      }
    }

    //find string variables
    for (let i = 1; i < exprNoQuotes.length; i++) {
      if (
        typeof exprNoQuotes[i] === "string" &&
        exprNoQuotes[i].indexOf("$") >= 0
      ) {
        exprNoQuotes[i - 1] += exprNoQuotes[i];
        exprNoQuotes[i] = "";
      }
    }

    let isNumberConst = 0;
    //find numeric constants
    for (let i = 0; i < exprNoQuotes.length; i++) {
      if (exprNoQuotes[i] >= "0" && exprNoQuotes[i] <= "9") {
        isNumberConst = 1;
      }
    }

    //check that all variables present in environment
    const allVars = exprNoQuotes.filter((el) => {
      if (el[0] >= "A" && el[0] <= "Z") {
        if (env.getVariableByName(el)) {
          return true;
        }
        msg.throwError(env.lp, msg.MESSAGES.EXE_NOT_DEFINED_ERR, el);
      }
      return false;
    });

    //check about mixed types
    let isTypesAreMixed = 0;
    allVars.forEach((el) => {
      isTypesAreMixed += (env.getVariableByName(el) as Variable).type;
    });
    //string vars + number vars
    isTypesAreMixed &&
      isTypesAreMixed !== allVars.length &&
      msg.throwError(env.lp, msg.MESSAGES.EXE_MIXED_TYPES_ERR);
    //string vars + number expression
    //(isTypesAreMixed) && (!isResultString) && (env.throwError("BAD EXPRESSION (MIXED TYPES)"));
    //string vars + number const
    isNumberConst &&
      isTypesAreMixed &&
      msg.throwError(env.lp, msg.MESSAGES.EXE_MIXED_TYPES_ERR);
    //string expression + number vars
    allVars.length &&
      isResultString &&
      !isTypesAreMixed &&
      msg.throwError(env.lp, msg.MESSAGES.EXE_MIXED_TYPES_ERR);
    //in result of calculations was number and string constants
    splittedExpr.forEach((el, idx) => {
      typeof el === "number" &&
        !/[A-Z$]/.test(splittedExpr[idx - 1]) &&
        (isResultString || isTypesAreMixed) &&
        msg.throwError(env.lp, msg.MESSAGES.EXE_MIXED_TYPES_ERR);
    });
    isNumberConst &&
      isResultString &&
      msg.throwError(env.lp, msg.MESSAGES.EXE_MIXED_TYPES_ERR);

    //prepare preffix string for eval
    let preffixStr = "";

    allVars.forEach((el) => {
      preffixStr += `var ${el}=`;
      preffixStr += (env.getVariableByName(el) as Variable).type
        ? `"${(env.getVariableByName(el) as Variable).value}";`
        : `${(env.getVariableByName(el) as Variable).value};`;
    });
    let exprRslt: string | number = 0;
    try {
      eval(`${preffixStr} exprRslt=${expression}`);
    } catch (e) {
      msg.throwError(env.lp, msg.MESSAGES.EXE_BAD_EXPR_ERR);
    }

    (String(exprRslt).indexOf("undefined") >= 0 ||
      String(exprRslt).indexOf("NaN") >= 0) &&
      msg.throwError(env.lp, msg.MESSAGES.EXE_BAD_EXPR_ERR);
    String(exprRslt) === "Infinity" &&
      msg.throwError(env.lp, msg.MESSAGES.EXE_ZERO_DIV_ERR);

    let rsltType = typeof exprRslt === "string" ? 1 : 0;
    if (typeof exprRslt === "boolean" || logicalXorFlag) {
      rsltType = 2;
      logicalXorFlag && (exprRslt = Boolean(exprRslt) as unknown as number);
    }

    //convert all numeric results to byte
    if (!rsltType) {
      exprRslt >>= 0;
      //exprRslt &= 0xFF;
    } else {
      //if not expression for printing then result checking for fit to string variable
      !print &&
        rsltType === 1 &&
        String(exprRslt).length > 8 &&
        (exprRslt = String(exprRslt).substring(0, 8));
    }

    return new ExpressionResult(exprRslt, rsltType);
  }

  //execute one command
  execute(cmd: Command | null, env: Environment): number {
    //empty strings / comments
    if (!cmd) {
      //if no one next IP then it's the end of program
      if (!env.setNextLP()) {
        throw new Error(msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG));
      }
      return 0x00;
    }

    const cmdName = cmd.name;

    //end of program
    if (cmdName === "END") {
      throw new Error(msg.makeMsg(msg.MESSAGES.EXE_COMPLITED_MSG));
    }

    //adding new variable (number or string)
    if (cmdName === "LET") {
      const operand = (cmd.operand as string).trim();
      const exprResult = cmd.expression
        ? this.calcExpression(cmd.expression as string, 0, 0, env)
        : null;
      let initValue;

      if (operand.indexOf("$") >= 0) {
        operand.length !== 2 &&
          msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_STR_NAME_ERR);
        exprResult &&
          exprResult.type !== 1 &&
          msg.throwError(env.lp, msg.MESSAGES.PARST_LET_STR_RSLT_ERR);
        initValue = "";
      } else {
        operand.length !== 1 &&
          msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_NUM_NAME_ERR);
        exprResult &&
          exprResult.type !== 0 &&
          msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_NUM_RSLT_ERR);
        initValue = 0;
      }
      env.createVar(operand, exprResult ? exprResult.rslt : initValue);
      return 0x01;
    }
    //adding new array
    if (cmdName === "DIM") {
      const operand = (cmd.operand as string).trim().split("(")[0];
      let initValue;

      if (operand.indexOf("$") >= 0) {
        operand.length !== 2 &&
          msg.throwError(env.lp, msg.MESSAGES.PARSE_DIM_STR_NAME_ERR);
        initValue = "";
      } else {
        operand.length !== 1 &&
          msg.throwError(env.lp, msg.MESSAGES.PARSE_DIM_NUM_NAME_ERR);
        initValue = 0;
      }

      const exprResult = this.calcExpression(
        (cmd.operand as string).trim().slice(operand.length),
        0,
        0,
        env
      );
      exprResult.type !== 0 &&
        msg.throwError(env.lp, msg.MESSAGES.PARSE_DIM_NUM_RSLT_ERR);

      const arraySize = exprResult.rslt;
      arraySize > 8 && msg.throwError(env.lp, msg.MESSAGES.PARSE_DIM_SIZE_ERR);
      !arraySize &&
        msg.throwError(env.lp, msg.MESSAGES.PARSE_DIM_ZERO_SIZE_ERR);

      for (let i = 0; i < arraySize; i++) {
        env.createVar(operand + String(i), initValue);
      }
      return 0x01;
    }
    //changing variable value
    if (cmdName === "=") {
      let operand = (cmd.operand as string).trim();
      const exprResult = this.calcExpression(
        cmd.expression as string,
        0,
        0,
        env
      );

      //array element
      if (/[A-Z]\$?\(.+\)/.test(operand)) {
        const idxStart = operand.indexOf("(");
        const idxEnd = operand.lastIndexOf(")");
        const arrIdxExprResult = this.calcExpression(
          operand.slice(idxStart, idxEnd + 1).trim(),
          0,
          0,
          env
        );
        arrIdxExprResult.type &&
          msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_IDX_ERR);
        operand = `${operand.slice(0, idxStart)}(${arrIdxExprResult.rslt})`;

        if (operand.indexOf("$") >= 0) {
          operand.length !== 5 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_STR_NAME_ERR);
          exprResult &&
            exprResult.type !== 1 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_STR_RSLT_ERR);
        } else {
          operand.length !== 4 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_NUM_NAME_ERR);
          exprResult &&
            exprResult.type &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_NUM_RSLT_ERR);
        }
        operand = operand.replace("(", "");
        operand = operand.replace(")", "");
      } else {
        if (operand.indexOf("$") >= 0) {
          operand.length !== 2 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_STR_NAME_ERR);
          exprResult &&
            exprResult.type !== 1 &&
            msg.throwError(env.lp, msg.MESSAGES.PARST_LET_STR_RSLT_ERR);
        } else {
          operand.length !== 1 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_NUM_NAME_ERR);
          exprResult &&
            exprResult.type &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_NUM_RSLT_ERR);
        }
      }

      env.getVariableByName(operand)
        ? ((env.getVariableByName(operand) as Variable).value = exprResult.rslt)
        : msg.throwError(
            env.lp,
            msg.MESSAGES.PARSE_ASSIGN_NOT_DEFINED_ERR,
            operand
          );
      return 0x01;
    }
    //if..then..else
    if (cmdName === "IF") {
      const operand = (cmd.operand as string).trim();
      const exprResult = this.calcExpression(
        cmd.expression as string,
        1,
        0,
        env
      );
      exprResult.type !== 2 &&
        msg.throwError(env.lp, msg.MESSAGES.PARSE_IF_NOT_BOOL_ERR);

      const ifElse = operand.split("ELSE");
      ifElse.length > 2 &&
        msg.throwError(env.lp, msg.MESSAGES.PARSE_IF_MANY_ELSE_ERR);

      return new Executor().execute(
        new Parser().parse(
          `${env.lp} ` +
            (exprResult.rslt ? ifElse[0].trim() : (ifElse[1] || "").trim()),
          env
        ),
        env
      );
    }
    //goto
    if (cmdName === "GOTO") {
      const exprResult = this.calcExpression(
        cmd.expression as string,
        0,
        0,
        env
      );
      exprResult &&
        exprResult.type &&
        msg.throwError(env.lp, msg.MESSAGES.PARSE_GOTO_NOT_NUM_ERR);
      env.setLp(exprResult.rslt as string) === null &&
        msg.throwError(
          env.lp,
          msg.MESSAGES.PARSE_GOTO_LINE_UNKNOWN_ERR,
          exprResult.rslt
        );
      return 0x00;
    }
    //gosub
    if (cmdName === "GOSUB") {
      const exprResult = this.calcExpression(
        cmd.expression as string,
        0,
        0,
        env
      );
      const rp = env.lp;
      exprResult &&
        exprResult.type &&
        msg.throwError(env.lp, msg.MESSAGES.PARSE_GOSUB_NOT_NUM_ERR);
      env.setLp(exprResult.rslt as string) === null &&
        msg.throwError(
          env.lp,
          msg.MESSAGES.PARSE_GOSUB_LINE_UNKNOWN_ERR,
          exprResult.rslt
        );
      env.createRP(rp);
      return 0x00;
    }
    //return
    if (cmdName === "RETURN") {
      //finding and deleting last return pointer
      const rp = env.deleteRP();
      rp === null && msg.throwError(env.lp, msg.MESSAGES.PARSE_RETURN_ERR);
      env.setLp(rp as string);
      return 0x01;
    }
    //print(ln)
    if (cmdName === "PRINT" || cmdName === "PRINTLN") {
      let exprResult: ExpressionResult | string = "";
      if (cmd.expression) {
        exprResult = this.calcExpression(cmd.expression, 0, 1, env);
        exprResult.type > 1 &&
          msg.throwError(env.lp, msg.MESSAGES.PARSE_PRINT_ERR);

        exprResult = String(
          /*(exprResult.type) ? */ exprResult.rslt /* : ((((exprResult.rslt as number) & 0xFF) ^ 0x80) - 0x80)*/
        );
      }
      //if println then adding "\n"
      env.screenPrint(exprResult, cmdName[cmdName.length - 1] === "N" ? 1 : 0);
      return 0x01;
    }
    //input
    if (cmdName === "INPUT") {
      let operand = (cmd.operand as string).trim();
      const histVal = env.inputHistory.getNextInputValue();
      histVal === null &&
        msg.throwError(env.lp, msg.MESSAGES.PARSE_INPUT_EMPTY_ERR);
      const inputResult = this.calcExpression(histVal as string, 0, 1, env);
      const exprResult = new ExpressionResult(
        inputResult && inputResult.type === 1
          ? (inputResult.rslt as string).substring(0, 8)
          : inputResult.rslt,
        inputResult.type
      );

      //ñäåëàòü âû÷èñëåíèå âûðàæåíèÿ,êîòîðîå ÿâëÿåòñÿ èíäåêñîì ýëåìåíòà ìàññèâà !!!!
      //äîáàâèòü òî æå ñàìîå â ïðèñâàèâàíèå ïåðåìåííîé!

      //array element
      if (/[A-Z]\$?\(.+\)/.test(operand)) {
        const idxStart = operand.indexOf("(");
        const idxEnd = operand.lastIndexOf(")");
        const arrIdxExprResult = this.calcExpression(
          operand.slice(idxStart, idxEnd + 1).trim(),
          0,
          0,
          env
        );
        arrIdxExprResult.type &&
          msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_IDX_ERR);
        operand = `${operand.slice(0, idxStart)}(${arrIdxExprResult.rslt})`;

        if (operand.indexOf("$") >= 0) {
          operand.length !== 5 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_STR_NAME_ERR);
          exprResult &&
            exprResult.type !== 1 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_STR_RSLT_ERR);
        } else {
          operand.length !== 4 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_NUM_NAME_ERR);
          exprResult &&
            exprResult.type &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_ASSIGN_NUM_RSLT_ERR);
        }
        operand = operand.replace("(", "");
        operand = operand.replace(")", "");
      } else {
        if (operand.indexOf("$") >= 0) {
          operand.length !== 2 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_STR_NAME_ERR);
          exprResult &&
            exprResult.type !== 1 &&
            msg.throwError(env.lp, msg.MESSAGES.PARST_LET_STR_RSLT_ERR);
        } else {
          operand.length !== 1 &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_NUM_NAME_ERR);
          exprResult &&
            exprResult.type &&
            msg.throwError(env.lp, msg.MESSAGES.PARSE_LET_NUM_RSLT_ERR);
        }
      }

      env.getVariableByName(operand)
        ? ((env.getVariableByName(operand) as Variable).value = exprResult.rslt)
        : msg.throwError(
            env.lp,
            msg.MESSAGES.PARSE_ASSIGN_NOT_DEFINED_ERR,
            operand
          );
      env.screenPrint(` \x02 ${inputResult.rslt}`, 1);
      return 0x01;
    }
    return 0x01;
  }
}
