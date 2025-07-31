import fs from "fs/promises";

export async function getDataArray<T>(path: string): Promise<T[] | null> {
  try {
    const fileData = await fs.readFile(path);
    const dataArray = JSON.parse(fileData.toString());
    return dataArray;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function writeDataArray<T>(
  path: string,
  dataArray: T[]
): Promise<boolean> {
  try {
    await fs.writeFile(path, Buffer.from(JSON.stringify(dataArray)));
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
