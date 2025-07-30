import { IncomingMessage, ServerResponse } from "http";
import { authenticateAndReturnUser, parseCookies } from "../auth";
import { getUserIdFromToken, generateToken } from "../auth";
import {
  verifyUser,
  getUsers,
  getUser,
  createUser,
  userExists,
  updateUserInDB,
} from "../db/user";
import { validateUsername, validatePassword } from "../db/validation";
import { parseBody } from "./helperMethods";

export async function users(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req, res);
    if (currentUser === null) throw new Error("unable to get user data");

    if (currentUser.role === "admin") {
      const usersArray = await getUsers();
      // handle null usersArray!
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

export async function updateUser(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const userIdFromPath = pathName.slice(7);
    console.log("Userid from path:", userIdFromPath);
    const currentUser = await authenticateAndReturnUser(req, res);
    if (currentUser === null)
      return res
        .writeHead(401, { "content-type": "Application/json" })
        .end(JSON.stringify({ error: "authorization failed" }));

    const updateUserObjectFromForm = (await parseBody(req)) as {
      username: string;
      password: string;
    };

    const { username: updatedUsername, password: updatedPassword } =
      updateUserObjectFromForm;

    // when trying to update user with different id
    // than of the logged user:
    if (currentUser.id !== userIdFromPath)
      return res
        .writeHead(403, { "content-type": "Application/json" })
        .end(JSON.stringify({ error: "forbidden" }));

    if (await !updateUserInDB(currentUser.id, updatedUsername, updatedPassword))
      return res
        .writeHead(500, { "content-type": "Application/json" })
        .end(JSON.stringify({ error: "update failed" }));

    return res
      .writeHead(200, { "Content-type": "Application/json" })
      .end(JSON.stringify({ success: "user updated" }));
  } catch (error) {
    console.log(error);
  }
}
