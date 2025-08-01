import { IncomingMessage, ServerResponse } from "http";
import { authenticateAndReturnUser, setAuthCookie } from "../auth";
import { generateToken } from "../auth";
import {
  verifyUser,
  getUsers,
  createUser,
  userExists,
  updateUserInDB,
  deleteUserFromDB,
} from "../db/user";
import { validateUsername, validatePassword } from "../db/validation";
import { parseBody } from "./helperMethods";
import { handleErrorResponse } from "./errorResponse";
import { handleSuccessResponse, writeToResponse } from "./successResponse";

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

export async function users(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

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
  }
}

export async function deleteUser(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

    const userIdFromPath = pathName.slice(7);
    if (!(currentUser.role === "admin" || currentUser.id === userIdFromPath))
      return handleErrorResponse("access forbidden", res);

    if (await !deleteUserFromDB(userIdFromPath))
      return handleErrorResponse("internal server error", res);

    return handleSuccessResponse("user deleted", res);
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
    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

    const userIdFromPath = pathName.slice(7);
    if (currentUser.id !== userIdFromPath)
      return handleErrorResponse("access forbidden", res);

    const updateUserObjectFromForm = (await parseBody(req)) as {
      username: string;
      password: string;
    };

    const { username: updatedUsername, password: updatedPassword } =
      updateUserObjectFromForm;

    if (
      await !updateUserInDB(
        currentUser.id,
        updatedUsername,
        updatedPassword,
        undefined
      )
    )
      return handleErrorResponse("internal server error", res);

    return handleSuccessResponse("user updated", res);
  } catch (error) {
    console.log(error);
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
    if (!setAuthCookie(res, token))
      handleErrorResponse("internal server error", res);
  } catch (error) {
    console.log(error);
  }
}
