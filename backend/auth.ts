import { IncomingMessage, ServerResponse } from "http";
import { PublicUser } from "./types";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getUser } from "./db/user";

const SECRET = process.env.SECRET as string;

export async function authenticateAndReturnUser(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
): Promise<PublicUser | null> {
  try {
    const cookies = parseCookies(req);
    if (cookies === null) throw new Error("cookies empty");

    const token = cookies.token;
    if (token === undefined) throw new Error("no token");

    // console.log("token: ", token);
    const currentUserId = getUserIdFromToken(token);

    // console.log("User got from token: ", currentUserId);
    const currentUser = await getUser(currentUserId);

    if (currentUser === undefined) throw new Error("user not found");
    if (currentUser === null) throw new Error("unable to get user data");

    return currentUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function generateToken(userId: string): string {
  const token = jwt.sign({ id: userId }, SECRET, { expiresIn: "10m" });
  return token;
}

export function getUserIdFromToken(token: string): string {
  type userIdPayload = JwtPayload & { id: string };
  const userPayload = jwt.verify(token, SECRET) as userIdPayload;
  console.log("Verify token: ", userPayload);
  return userPayload.id;
}

export function setAuthCookie(res: ServerResponse, token: string) {
  res
    .writeHead(200, {
      "Set-Cookie": `token=${token}; Path=/; HttpOnly`,
      "content-type": "Application/json",
    })
    .end(JSON.stringify({ message: `użytkownik zalogowany` }));
}

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
