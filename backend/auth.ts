import { IncomingMessage } from "http";
import { User } from "./types";

export function generateToken(userId: string): string {
  return "";
}

export function getUserFromToken(token: string): User | null {
  return null;
}

// export function setAuthCookie(res: ServerResponse, token: string) {}

export function parseCookies(
  req: IncomingMessage
): Record<string, string> | null {
  if (!req.headers.cookie) return null;

  const cookiesObject: Record<string, string> = {};
  const cookiesArray: string[] = req.headers.cookie?.split("; ");

  for (const cookieString of cookiesArray) {
    const [key, value] = cookieString.split("=");
    // console.log(key, value);
    cookiesObject[key] = value;
  }

  return cookiesObject;
}
