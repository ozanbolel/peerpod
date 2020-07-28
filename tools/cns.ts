export const cns = (array: (string | [string, boolean | undefined] | undefined)[]) => {
  let result: string[] = [];

  for (let item of array) {
    if (item) {
      if (typeof item === "string") {
        result.push(item);
      } else {
        if (item[1]) result.push(item[0]);
      }
    }
  }

  return result.join(" ");
};
