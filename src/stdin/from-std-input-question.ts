import { defer, identity } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import {} from "rxjs/fetch";
import { fromCmdInput } from "./from-cmd-input";

export type InputQuestion = [string, string[]] | [string];
export function fromStdInputQuestion(questionAndAnswer: InputQuestion) {
  return defer(() => {
    const [question, answers] = questionAndAnswer;
    process.stdout.write(`\n${question}\n`);
    let writeAnswer: any;
    if (answers) {
      writeAnswer = () => process.stdout.write(`${answers.join("/")}:`);
    } else {
      writeAnswer = () => process.stdout.write("Answer:");
    }
    writeAnswer();
    return fromCmdInput().pipe(
      answers
        ? filter((line) => {
            const isAnwser = answers.includes(line.trim());
            if (!isAnwser) {
              writeAnswer();
            }
            return isAnwser;
          })
        : identity,
      map((line) => {
        const answer = line.trim();
        return { question, answer: answer };
      }),
      take(1)
    );
  });
}
