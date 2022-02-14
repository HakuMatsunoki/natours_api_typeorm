import path from "path";
import { v1 as uuidV1 } from "uuid";

export interface FileName {
  path: string,
  file: string
}

export const fileNameBuilder = (
  extension: string,
  itemType: string,
  itemId: string
): FileName => {
  const file = `${uuidV1()}.${extension}`;

  return {
    path: path.join(itemType, itemId, file),
    file
  };
};
