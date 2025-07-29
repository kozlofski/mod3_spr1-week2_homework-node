import { IncomingMessage, ServerResponse } from "http";
import { parseCookies } from "../auth";
import { getUserIdFromToken, generateToken } from "../auth";
import { verifyUser, getUsers, getUser } from "../db/user";
import { parseBody } from "./helperMethods";

export async function users(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const cookies = parseCookies(req);
    if (cookies === null) throw new Error("cookies empty");

    const token = cookies.token;
    if (token === undefined) throw new Error("no token");

    console.log("token: ", token);
    const currentUserId = getUserIdFromToken(token);

    console.log("User got from token: ", currentUserId);
    const currentUser = await getUser(currentUserId);
    console.log("Current user: ", currentUser);
    if (currentUser === undefined) throw new Error("user not found");
    if (currentUser === null) throw new Error("unavailable to get user data");

    if (currentUser.role === "admin") {
      const usersArray = await getUsers();
      return res.writeHead(200).end(JSON.stringify(usersArray));
    } else {
      return res.writeHead(200).end(JSON.stringify(currentUser));
    }
    // res.writeHead(200).end("login ok");
  } catch (error) {
    console.log(error);
    return res.writeHead(401).end("authorization failed");
  }
}

export async function login(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const loginObjectFromForm = (await parseBody(req)) as {
      username: string;
      password: string;
    };
    const { username, password } = loginObjectFromForm;
    const loggedUserId = await verifyUser(username, password);

    if (loggedUserId === undefined) throw new Error("logowanie nieudane");

    const token = generateToken(loggedUserId);
    return res
      .writeHead(200, {
        "Set-Cookie": `token=${token}; Path=/users; HttpOnly`,
        "content-type": "Application/json",
      })
      .end(JSON.stringify({ message: `użytkownik ${username} zalogowany` }));
  } catch (error) {
    console.log(error);
    return res
      .writeHead(401, {
        "content-type": "Application/json",
      })
      .end(JSON.stringify({ error: "logowanie nieudane" }));
  }
}
