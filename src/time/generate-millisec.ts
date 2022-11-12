interface MillsecGeneratorOption {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export function generateMillsec(options: MillsecGeneratorOption) {
  let millisec = 0;

  millisec += options.seconds ? options.seconds * 1000 : 0;
  millisec += options.minutes ? options.minutes * 60000 : 0;
  millisec += options.hours ? options.hours * 3600000 : 0;
  millisec += options.days ? options.days * 86_400_000 : 0;
  return millisec;
}
