import { BehaviorSubject, fromEvent, timer } from "rxjs";
import {
  exhaustMap,
  finalize,
  map,
  share,
  switchMap,
  tap,
} from "rxjs/operators";

const noti$ = new BehaviorSubject(0);
noti$.subscribe((noti) => {
  const notiNumberEl = document.querySelector<HTMLElement>(
    ".notification-container .noti-number"
  )!;
  if (noti === 0) {
    notiNumberEl.style.visibility = "hidden";
  } else {
    notiNumberEl.style.visibility = "unset";
    setNotiNumber(notiNumberEl, noti);
  }
});

const serverEvent$ = joinServerEvents("http://localhost:3000/events").pipe(
  share()
);

let noti = noti$.value;
serverEvent$
  .pipe(
    tap(() => {
      noti++;
    }),
    exhaustMap(() => {
      return shakingAnimation();
    })
  )
  .subscribe(() => {
    noti$.next(noti);
  });

function shakingAnimation() {
  const imageNoti = document.querySelector(
    ".notification-container .notification"
  )!;
  imageNoti.classList.add("shaking");
  return timer(400).pipe(
    tap(() => {
      imageNoti.classList.remove("shaking");
    })
  );
}

function setNotiNumber(element: HTMLElement, num: number) {
  element.innerText = `${num}`;
}

function joinServerEvents(url: string) {
  const events = new EventSource(url);
  return fromEvent(events, "open").pipe(
    finalize(() => {
      events.close();
    }),
    switchMap(() => {
      return fromEvent<MessageEvent>(events, "message").pipe(
        map((event) => event.data)
      );
    })
  );
}
