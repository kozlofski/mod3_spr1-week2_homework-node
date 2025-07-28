import { ServerResponse, IncomingMessage } from "http";
import { readStaticFile } from "../db/static";

export const staticPaths = [
  "/",
  "/static/main.js",
  "/static/style.css",
  "/favicon.ico",
];

export async function getStaticFile(
  pathName: string | null,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const file = await readStaticFile(pathName);
    res.end(file);
  } catch (error) {
    console.error("Error parsing request URL:", error);
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request");
    return;
  }
}
