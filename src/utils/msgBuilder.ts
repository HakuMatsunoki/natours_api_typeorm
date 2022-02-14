export const requestsLimitMsg = (time: number): string =>
  `Too many requests from this ip address. Please, try again in an ${time} hour${
    time !== 1 ? "s" : ""
  }..`;

export const noUrlMsg = (url: string): string =>
  `Can't find ${url} on this server..`;

export const mustHaveMsg = (item: string, propName: string): string =>
  `A(n) ${item} must have a(n) ${propName}..`;

export const mustBeMsg = (item: string, cond: string): string =>
  `A(n) ${item} must be ${cond}..`;
