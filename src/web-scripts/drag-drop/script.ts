import { from, fromEvent, merge } from "rxjs";
import { webSocket } from "rxjs/webSocket";
import {
  exhaustMap,
  filter,
  map,
  mergeMap,
  takeUntil,
  tap,
} from "rxjs/operators";

const webSocketSubject = webSocket({
  url: "ws://localhost:4000",
  deserializer: (serverMessage) => {
    return JSON.parse(serverMessage.data);
  },
});

const elementList = document.querySelectorAll<HTMLImageElement>("[data-drag]");

from(elementList.values())
  .pipe(
    mergeMap((element) => {
      element.style.cursor = "grab";
      let translateX = 0;
      let translateY = 0;
      const movedown$ = fromEvent<MouseEvent>(element, "mousedown").pipe(
        exhaustMap((downEvent) => {
          downEvent.preventDefault();
          const mouseup$ = fromEvent<MouseEvent>(document, "mouseup");
          return fromEvent<MouseEvent>(document, "mousemove").pipe(
            tap((moveEvent) => {
              const dx = moveEvent.x - downEvent.x;
              const dy = moveEvent.y - downEvent.y;
              const rx = translateX + dx;
              const ry = translateY + dy;
              element.style.transform = `translate(${rx}px, ${ry}px)`;

              webSocketSubject.next({
                alt: element.getAttribute("alt"),
                x: rx,
                y: ry,
              });
            }),
            takeUntil(
              mouseup$.pipe(
                tap((upEvent) => {
                  const dx = upEvent.x - downEvent.x;
                  const dy = upEvent.y - downEvent.y;

                  translateX = translateX + dx;
                  translateY = translateY + dy;
                })
              )
            )
          );
        })
      );

      const updateFromServer$ = webSocketSubject.pipe(
        map((msg) => msg[element.alt]),
        filter((state) => {
          return state !== undefined;
        }),
        tap((state) => {
          const { x, y } = JSON.parse(state);

          translateX = x;
          translateY = y;
          element.style.transform = `translate(${x}px, ${y}px)`;
        })
      );

      return merge(movedown$, updateFromServer$);
    })
  )
  .subscribe();
