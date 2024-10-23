const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function withFrameDelay(fn, ms) {
  return async (...args) => {
    await wait(ms);
    return fn(...args);
  };
}

export function createSeededRandom(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16)
  );
}
