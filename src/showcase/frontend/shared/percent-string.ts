export function percentString(loaded: number, total: number) {
  return ((loaded / total) * 100).toFixed(2) + " %";
}
