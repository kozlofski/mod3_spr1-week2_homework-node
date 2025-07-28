import { IncomingMessage, ServerResponse } from "http";
import { parseCookies } from "../auth";

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
    console.log(token);
    // const token = (req.headers.cookie || "").split("token=")[1];
    // if (!token) return res.writeHead(401).end("no token");
    // const user = verifyToken(token);
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
