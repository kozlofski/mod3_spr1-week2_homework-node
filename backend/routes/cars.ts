import { IncomingMessage, ServerResponse } from "http";
import { parseBody } from "./helperMethods";

import { carExists, createCar } from "../db/car";

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

    if (await carExists(model))
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
