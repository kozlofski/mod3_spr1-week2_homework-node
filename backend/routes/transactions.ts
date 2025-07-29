import { IncomingMessage, ServerResponse } from "http";
import { parseCookies } from "../auth";
import { getUserIdFromToken } from "../auth";
import { getUser } from "../db/user";
import { carExists, carIsAvailable, getCar } from "../db/car";
import { Car } from "../types";

export async function buyCar(
  pathName: string,
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

    const carId = pathName.slice(6, -4);
    console.log("buy car with id:", carId);

    const car = await getCar(carId);
    if (car === null)
      return res
        .writeHead(500, { "content-type": "Application/json" })
        .end(JSON.stringify({ error: `car data not available from db` }));

    if (car === undefined)
      return res.writeHead(400, { "content-type": "Application/json" }).end(
        JSON.stringify({
          error: `car with ID ${carId} doesn't exist in database`,
        })
      );

    if (car.ownerId !== null)
      return res
        .writeHead(400, { "content-type": "Application/json" })
        .end(JSON.stringify({ error: `car with ID ${carId} already bought` }));

    const carPrice = car.price;
    const userBalance = currentUser.balance;

    if (carPrice > userBalance)
      return res.writeHead(400, { "content-type": "Application/json" }).end(
        JSON.stringify({
          error: `user ${currentUser.username} doesn't have enough money to buy ${car.model}`,
        })
      );

    // }
  } catch (error) {
    console.log(error);
    return res.writeHead(401).end("authorization failed");
  }
}
