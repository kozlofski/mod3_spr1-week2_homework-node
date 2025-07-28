import { IncomingMessage } from "http";
import { User } from "./types";
import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.SECRET as string;

export function generateToken(userId: string): string {
  const token = jwt.sign({ id: userId }, SECRET, { expiresIn: "10m" });
  return token;
}

export function getUserFromToken(token: string): JwtPayload {
  console.log("secret: ", SECRET);
  const userPayload = jwt.verify(token, SECRET) as JwtPayload;
  console.log("Verify token: ", userPayload);
  return userPayload;
  // return null;
}

// export function verifyToken(token: string) {
//   const userPayload = jwt.verify(token, SECRET) as JwtPayload;
//   console.log("Verify token: ", userPayload);
//   return userPayload;
//   // return jwt.verify(token, SECRET) as JwtPayload;
// }

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
