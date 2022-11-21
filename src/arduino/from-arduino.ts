import { from, ReplaySubject, Subject } from "rxjs";
import { switchMap, share, bufferWhen, filter, map, tap } from "rxjs/operators";
import SerialPort from "serialport";
import { fromListener } from "../operators/from-listener";

export class FromArduino {
  private onOpen$ = new ReplaySubject<void>(1);
  private command$ = new ReplaySubject<string>(1);

  data$ = new Subject<string>();

  serialPort = SerialPort;

  constructor(private options: { path: string; baudRate: number }) {
    const arduino = new SerialPort(this.options.path, {
      baudRate: this.options.baudRate,
    });

    fromListener(arduino, "open").subscribe(this.onOpen$);

    const bufferData$ = this.onOpen$.pipe(
      switchMap(() => {
        return fromListener(arduino, "data");
      }),
      share()
    );

    bufferData$
      .pipe(
        bufferWhen(() => {
          return bufferData$.pipe(
            filter((value) => `${value}`.indexOf("\n") !== -1)
          );
        }),
        map((bufferList) => {
          const bufferCombine = Buffer.concat(bufferList);
          return `${bufferCombine}`.trim();
        })
      )
      .subscribe(this.data$);

    this.onOpen$
      .pipe(
        switchMap(() => {
          return this.command$.pipe(
            tap((cmd) => {
              const command = `${cmd}\r\n`;
              //   console.log(`send command to arduino: ${command}`);
              arduino.write(command);
            })
          );
        })
      )
      .subscribe();
  }

  sendCommand(cmd: string) {
    this.command$.next(cmd);
  }

  readPin(pin: number) {
    // this.sendCommand(`ATDIP+${pin}`);
    this.sendCommand(`ATDIN+${pin}`);
  }

  setPin(pin: number, value: "H" | "L") {
    const command = `ATDO${value}+${pin}`;
    this.sendCommand(command);
  }
}
