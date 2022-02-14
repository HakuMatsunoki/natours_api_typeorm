export const userNameHandler = (name: string): string => {
  if (typeof name !== "string") return "";

  const handledArray: string[] = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z]/g, " ")
    .split(" ");

  const resultArray: string[] = [];

  for (const item of handledArray) {
    if (item) resultArray.push(item.charAt(0).toUpperCase() + item.slice(1));
  }

  return resultArray.join(" ");
};
