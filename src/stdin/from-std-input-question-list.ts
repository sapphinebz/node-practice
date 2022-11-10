import { from, identity } from "rxjs";
import { concatMap, filter, map, take, toArray } from "rxjs/operators";
import {} from "rxjs/fetch";
import { fromCmdInput } from "./from-cmd-input";
import { fromStdInputQuestion, InputQuestion } from "./from-std-input-question";

export type InputQuestionList = InputQuestion[];
export function fromStdInputQuestionList(questions: InputQuestionList) {
  return from(questions).pipe(
    concatMap((questionAndAnswer) => {
      return fromStdInputQuestion(questionAndAnswer);
    }),
    toArray()
  );
}
