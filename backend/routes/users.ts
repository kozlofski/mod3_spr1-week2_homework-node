import { IncomingMessage, ServerResponse } from "http";
import { parseCookies } from "../auth";
import { getUserFromToken, generateToken } from "../auth";
import { verifyUser } from "../db/user";
import { parseBody } from "./helperMethods";

export async function users(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const cookies = parseCookies(req);
    if (cookies === null) {
      throw new Error("cookies empty");
    }
    const token = cookies.token;
    if (token === undefined) {
      throw new Error("no token");
    }
    console.log("token: ", token);
    const user = getUserFromToken(token);

    console.log(user);

    // if (user.role === "admin") {
    //   const usersArray = await getUsers();
    //   return res.writeHead(200).end(JSON.stringify(usersArray));
    // } else {
    //   const completeUserData = await getUserDataByName(user.username);
    //   if (completeUserData === undefined)
    //     throw new Error("Error getting complete user data");
    //   const userDataWithBalance = {
    //     id: completeUserData.id,
    //     username: user.username,
    //     role: user.role,
    //     balance: completeUserData.balance,
    //   };
    //   return res.writeHead(200).end(JSON.stringify(userDataWithBalance));
    // }
    res.writeHead(200).end("login ok");
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
      .end(`użytkownik ${username} zalogowany`);
  } catch (error) {
    console.log(error);
    return res
      .writeHead(401, {
        "content-type": "Application/json",
      })
      .end(JSON.stringify({ error: "logowanie nieudane" }));
  }
}
