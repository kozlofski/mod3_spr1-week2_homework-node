import { IncomingMessage, ServerResponse } from "http";
import { parseCookies } from "../auth";
import { getUserIdFromToken, generateToken } from "../auth";
import {
  verifyUser,
  getUsers,
  getUser,
  createUser,
  userExists,
} from "../db/user";
import { validateUsername, validatePassword } from "../db/validation";
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
    if (currentUser === null) throw new Error("unable to get user data");

    if (currentUser.role === "admin") {
      const usersArray = await getUsers();
      return res.writeHead(200).end(JSON.stringify(usersArray));
    } else {
      return res.writeHead(200).end(JSON.stringify(currentUser));
    }
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

    console.log("Trying to login:", username, password);

    const loggedUserId = await verifyUser(username, password);

    if (loggedUserId === undefined) throw new Error("logowanie nieudane");

    const token = generateToken(loggedUserId);
    return res
      .writeHead(200, {
        "Set-Cookie": `token=${token}; Path=/; HttpOnly`,
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

export async function register(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const newUserObjectFromForm = (await parseBody(req)) as {
      username: string;
      password: string;
    };
    const { username, password } = newUserObjectFromForm;
    console.log("New user data:", username, password);

    if (!validateUsername(username) || !validatePassword(password))
      return res.writeHead(400).end(
        JSON.stringify({
          error: "walidacja nazwy użytkownika lub hasła niepomyślna",
        })
      );

    if (await userExists(username))
      return res.writeHead(400).end(
        JSON.stringify({
          error: `nazwa użytkownika ${username} zajęta`,
        })
      );

    if (await createUser(username, password, "user"))
      return res
        .writeHead(201)
        .end(JSON.stringify({ message: `Utworzono użytkownika ${username}` }));
  } catch (error) {
    console.log(error);
  }
}
