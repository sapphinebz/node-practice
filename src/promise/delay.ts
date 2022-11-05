export function delay(millsec: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, millsec);
  });
}
