import { userNameHandler } from "../";

interface JestObj {
  input: any;
  output: string;
}

const testingData: JestObj[] = [
  { input: "Jimi Hendrix", output: "Jimi Hendrix" },
  { input: "jimi hendrix", output: "Jimi Hendrix" },
  { input: "jimi Hendrix", output: "Jimi Hendrix" },
  { input: "   Jimi  hendriX ", output: "Jimi Hendrix" },
  { input: "Jimi_Hendrix", output: "Jimi Hendrix" },
  { input: "jimi.hendrix", output: "Jimi Hendrix" },
  { input: "jimi@hend@rix", output: "Jimi Hend Rix" },
  { input: "_jimi * hendrix", output: "Jimi Hendrix" },
  { input: "jimi hèndrix__", output: "Jimi Hendrix" },
  { input: "jimi中村hèndrix__", output: "Jimi Hendrix" },
  { input: "jimi de Hèndrix__", output: "Jimi De Hendrix" },
  { input: "中村哲二", output: "" },
  { input: undefined, output: "" },
  { input: null, output: "" },
  { input: true, output: "" },
  { input: "{bad: code}", output: "Bad Code" },
  { input: "<bad>*<code>", output: "Bad Code" },
  { input: JSON.stringify({ bad: "code" }), output: "Bad Code" }
];

describe("Test utils", () => {
  test("Test userNameHandler", () => {
    for (const item of testingData) {
      const normalizedName = userNameHandler(item.input);
      expect(normalizedName).toBe(item.output);
    }
  });
});
