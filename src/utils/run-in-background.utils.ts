export function runInBackground(cb: () => Promise<void>) {
  (async () => {
    try {
      await cb();
    } catch (error) {
      console.error(error);
    }
  })();
}
