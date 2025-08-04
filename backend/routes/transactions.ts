import { IncomingMessage, ServerResponse } from "http";
import { EventEmitter } from "events";

import { authenticateAndReturnUser, setAuthCookie } from "../auth";
import { handleErrorResponse } from "./errorResponse";
import { handleSuccessResponse } from "./successResponse";
import { getCar, editCar } from "../db/car";
import { editUser } from "../db/user";
import { handleSSE } from "./sse";

export const transactionEventBus = new EventEmitter();

export async function buyCar(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("access forbidden", res);
    setAuthCookie(res, currentUser.id);

    const carId = pathName.slice(6, -4);

    const car = await getCar(carId);
    if (car === null) return handleErrorResponse("car data unavailable", res);

    if (car === undefined) return handleErrorResponse("car doesn't exist", res);

    if (car.ownerId !== null)
      return handleErrorResponse("car already bought", res);

    const carPrice = car.price;
    const userBalance = currentUser.balance;

    if (carPrice > userBalance)
      return handleErrorResponse("not enough money", res);
    const newUserBalance = userBalance - carPrice;

    // next two operations should together be inside a transaction -
    // error in updating user balance should rollback updated car owner
    // but it can be easily done in a proper DBMS
    if (await !editCar(carId, undefined, currentUser.id))
      return handleErrorResponse("internal server error", res);

    if (await !editUser(currentUser.id, undefined, undefined, newUserBalance))
      return handleErrorResponse("internal server error", res);

    const sseEventData = {
      event: "car-bought",
      carId: carId,
      buyerId: currentUser.id,
    };

    handleSSE("car bought", sseEventData);

    return handleSuccessResponse("transaction successful", res);
  } catch (error) {
    console.log(error);
  }
}
