import { IncomingMessage, ServerResponse } from "http";
import { authenticateAndReturnUser } from "../auth";
import { handleErrorResponse } from "./errorResponse";
import { getCar, updateCarInDB } from "../db/car";
import { updateUserInDB } from "../db/user";
import { handleSuccessResponse } from "./successResponse";

export async function buyCar(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req);
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

    if (carPrice > userBalance)
      return handleErrorResponse("not enough money", res);
    const newUserBalance = userBalance - carPrice;

    // next two operations should be a transaction -
    // error in updating user balance should rollback updating car info
    // can be easily done in a proper DB
    if (await !updateCarInDB(carId, undefined, currentUser.id))
      return handleErrorResponse("internal server error", res);

    if (
      await !updateUserInDB(
        currentUser.id,
        undefined,
        undefined,
        newUserBalance
      )
    )
      return handleErrorResponse("internal server error", res);

    return handleSuccessResponse("transaction successful", res);
    // to finish update balance, update car owner
  } catch (error) {
    console.log(error);
  }
}
