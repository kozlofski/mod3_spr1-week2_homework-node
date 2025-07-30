import { IncomingMessage, ServerResponse } from "http";
import { authenticateAndReturnUser, parseCookies } from "../auth";
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
    const currentUser = await authenticateAndReturnUser(req, res);
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
