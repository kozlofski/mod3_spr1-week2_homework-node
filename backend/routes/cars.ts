import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "./helperMethods";

import { carModelExists, createCar, getCars } from "../db/car";
import { handleErrorResponse } from "./errorResponse";
import { handleSuccessResponse, writeToResponse } from "./successResponse";

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
    const carsArray = await getCars();
    if (carsArray === null)
      return handleErrorResponse("car data unavailable", res);

    return writeToResponse(carsArray, res);
  } catch (error) {
    console.log(error);
  }
}
