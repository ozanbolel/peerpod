export function formatString(string: string, maxCharacters: number) {
  string = string.trim();

  if (string.length > maxCharacters) {
    return string.substring(0, maxCharacters - 3) + "...";
  }

  return string;
}
