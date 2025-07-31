import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "./helperMethods";

import { carModelExists, createCar, getCars, updateCarInDB } from "../db/car";
import { handleErrorResponse } from "./errorResponse";
import { handleSuccessResponse, writeToResponse } from "./successResponse";
import { authenticateAndReturnUser } from "../auth";

export async function addCar(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const newCarObjectFromForm = (await parseBody(req)) as {
      model: string;
      price: string;
    };
    const { model, price } = newCarObjectFromForm;

    if (await carModelExists(model))
      return handleErrorResponse("car model already exists", res);

    if (await !createCar(model, price))
      return handleErrorResponse("server error; car wasn't created", res);

    return handleSuccessResponse("car created", res);
  } catch (error) {
    console.log(error);
  }
}

export async function cars(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

    const carsArray = await getCars();
    if (carsArray === null)
      return handleErrorResponse("car data unavailable", res);

    return writeToResponse(carsArray, res);
  } catch (error) {
    console.log(error);
  }
}

export async function updatePriceOrUser(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const carIdFromPath = pathName.slice(6);

    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

    if (currentUser.role !== "admin")
      return handleErrorResponse("access forbidden", res);

    const updateCarObjectFromForm = (await parseBody(req)) as {
      price: number;
      userId: string;
    };

    const { price: updatedPrice, userId: updatedUserId } =
      updateCarObjectFromForm;

    if (await !updateCarInDB(carIdFromPath, updatedPrice, updatedUserId))
      return handleErrorResponse("internal server error", res);

    return handleSuccessResponse("car updated", res);
  } catch (error) {
    console.log(error);
  }
}
