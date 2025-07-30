import { IncomingMessage, ServerResponse } from "http";
import { authenticateAndReturnUser, setAuthCookie } from "../auth";
import { generateToken } from "../auth";
import {
  verifyUser,
  getUsers,
  createUser,
  userExists,
  updateUserInDB,
} from "../db/user";
import { validateUsername, validatePassword } from "../db/validation";
import { parseBody } from "./helperMethods";
import { handleErrorResponse } from "./errorResponse";
import { handleSuccessResponse, writeToResponse } from "./successResponse";

export async function users(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req, res);
    if (currentUser === null) throw new Error("unable to get user data");

    if (currentUser.role === "admin") {
      const usersArray = await getUsers();
      if (usersArray === null)
        return handleErrorResponse("user data unavailable", res);

      return writeToResponse(usersArray, res);
    } else {
      return writeToResponse(currentUser, res);
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
    const loggedUserId = await verifyUser(username, password);

    if (loggedUserId === undefined)
      return handleErrorResponse("login failed", res);

    const token = generateToken(loggedUserId);
    return setAuthCookie(res, token);
  } catch (error) {
    console.log(error);
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

    if (!validateUsername(username) || !validatePassword(password))
      return handleErrorResponse("validation error", res);

    if (await userExists(username))
      return handleErrorResponse("username taken", res);

    if (await !createUser(username, password, "user"))
      return handleErrorResponse("server error; user wasn't created", res);

    return handleSuccessResponse("user created", res);
  } catch (error) {
    console.log(error);
  }
}

export async function updateUsernameOrPassword(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const userIdFromPath = pathName.slice(7);
    const currentUser = await authenticateAndReturnUser(req, res);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

    const updateUserObjectFromForm = (await parseBody(req)) as {
      username: string;
      password: string;
    };

    const { username: updatedUsername, password: updatedPassword } =
      updateUserObjectFromForm;

    if (currentUser.id !== userIdFromPath)
      return handleErrorResponse("access forbidden", res);

    if (await !updateUserInDB(currentUser.id, updatedUsername, updatedPassword))
      return handleErrorResponse("internal server error", res);

    return handleSuccessResponse("user updated", res);
  } catch (error) {
    console.log(error);
  }
}
