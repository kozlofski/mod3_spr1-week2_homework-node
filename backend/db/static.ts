import path from "path";
import fs from "fs/promises";

export async function readStaticFile(pathName: string | null) {
  if (!pathName) return;
  let pathToFile = "";
  pathName === "/"
    ? (pathToFile = path.join(__dirname, "../static/index.html"))
    : (pathToFile = path.join(__dirname, "../", pathName));

  const file = await fs.readFile(pathToFile);
  return file;
}
