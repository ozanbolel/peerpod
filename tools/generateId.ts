const dec2hex = (num: number) => {
  return num < 10 ? "0" + String(num) : num.toString(16);
};

const gen = (len: number) => {
  const decArray = new Uint8Array(len === 1 ? len : len / 2);
  window.crypto.getRandomValues(decArray);
  const hexArray = Array.from(decArray, dec2hex);

  if (len === 1) return hexArray.join("")[0];
  return hexArray.join("");
};

export const generateId = (length = 16) => {
  if (typeof window !== "undefined") {
    let result = "";

    const loop = () => {
      if (result.length < length) {
        result += gen(length - result.length);
        loop();
      }
    };
    loop();

    return result;
  }

  return "";
};
