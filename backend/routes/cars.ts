import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "./helperMethods";

import {
  carModelExists,
  carExists,
  carIsAvailable,
  createCar,
  getCars,
} from "../db/car";
import { getUserIdFromToken, parseCookies } from "../auth";
import { getUser } from "../db/user";

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

    console.log("Trying to create new car:", model, price);

    if (await carModelExists(model))
      return res.writeHead(400).end(
        JSON.stringify({
          error: `samochód ${model} już istnieje w bazie`,
        })
      );

    if (await createCar(model, price))
      return res
        .writeHead(201)
        .end(JSON.stringify({ message: `Dodano samochód ${model}` }));
  } catch (error) {
    console.log(error);
    return res
      .writeHead(401, {
        "content-type": "Application/json",
      })
      .end(JSON.stringify({ error: "dodawanie samochodu nieudane" }));
  }
}

export async function cars(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  try {
    const carsArray = await getCars();
    if (carsArray === null)
      return res
        .writeHead(500, { "content-type": "Application/json" })
        .end(JSON.stringify({ error: "cars data unavailable" }));

    return res
      .writeHead(200, { "content-type": "Application/json" })
      .end(JSON.stringify(carsArray));
  } catch (error) {}
}
