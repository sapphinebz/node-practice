export function generateToken() {
  return Array.from({ length: 30 }, () => {
    return ((Math.random() * 36) | 0).toString(36);
  }).join("");
}
