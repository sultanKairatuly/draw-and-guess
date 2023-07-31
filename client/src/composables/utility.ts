export function warn(target: object, message: string, delay: number = 1700) {
  if ("value" in target) {
    target.value = message;
    setTimeout(() => {
      target.value = "";
    }, delay);
  }
}

