import { IncomingMessage, ServerResponse } from "http";

import { addCar, getCars, editCar, removeCar, carModelExists } from "../db/car";

import { parseBody } from "./helperMethods";
import { handleErrorResponse } from "./errorResponse";
import { handleSuccessResponse, writeToResponse } from "./successResponse";
import { authenticateAndReturnUser } from "../auth";

// CREATE
export async function createCar(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

    if (currentUser.role !== "admin")
      return handleErrorResponse("access forbidden", res);

    const newCarObjectFromForm = (await parseBody(req)) as {
      model: string;
      price: string;
    };
    const { model, price } = newCarObjectFromForm;

    if (await carModelExists(model))
      return handleErrorResponse("car model already exists", res);

    if (await !addCar(model, price))
      return handleErrorResponse("server error; car wasn't created", res);

    return handleSuccessResponse("car created", res);
  } catch (error) {
    console.log(error);
  }
}

// READ
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

// UPDATE
export async function updatePriceOrUser(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

    if (currentUser.role !== "admin")
      return handleErrorResponse("access forbidden", res);

    const carIdFromPath = pathName.slice(6);

    const updateCarObjectFromForm = (await parseBody(req)) as {
      price: number;
      userId: string;
    };

    const { price: updatedPrice, userId: updatedUserId } =
      updateCarObjectFromForm;

    if (await !editCar(carIdFromPath, updatedPrice, updatedUserId))
      return handleErrorResponse("internal server error", res);

    return handleSuccessResponse("car updated", res);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteCar(
  pathName: string,
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const currentUser = await authenticateAndReturnUser(req);
    if (currentUser === null)
      return handleErrorResponse("authorization failed", res);

    if (currentUser.role !== "admin")
      return handleErrorResponse("access forbidden", res);

    const carIdFromPath = pathName.slice(6);

    if (await !removeCar(carIdFromPath))
      return handleErrorResponse("internal server error", res);

    return handleSuccessResponse("car deleted", res);
  } catch (error) {
    console.log(error);
  }
}
