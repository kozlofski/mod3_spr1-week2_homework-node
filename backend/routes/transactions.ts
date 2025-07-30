import { IncomingMessage, ServerResponse } from "http";
import { authenticateAndReturnUser, parseCookies } from "../auth";
import { getUserIdFromToken } from "../auth";
import { getUser } from "../db/user";
import { carExists, carIsAvailable, getCar } from "../db/car";
import { Car } from "../types";
import { handleErrorResponse } from "./helperMethods";

export async function buyCar(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req, res);
    if (currentUser === null)
      return handleErrorResponse("access forbidden", res);

    const carId = pathName.slice(6, -4);

    const car = await getCar(carId);
    if (car === null) return handleErrorResponse("car data unavailable", res);

    if (car === undefined) return handleErrorResponse("car doesn't exist", res);

    if (car.ownerId !== null)
      return handleErrorResponse("car already bought", res);

    const carPrice = car.price;
    const userBalance = currentUser.balance;

    if (carPrice > userBalance) handleErrorResponse("not enough money", res);

    // to finish update balance, update car owner
  } catch (error) {
    console.log(error);
  }
}
