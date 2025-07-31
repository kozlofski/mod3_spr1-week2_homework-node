import { IncomingMessage, ServerResponse } from "http";
import { ResponsePayload, SuccessToResponse } from "../types";

export function handleSuccessResponse(
  message: SuccessToResponse,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
): void {
  let statusCode: number;
  let successMessage: string;

  switch (message) {
    case "login successful":
      statusCode = 200;
      successMessage = "logowanie udane";
      break;
    case "user created":
      statusCode = 201;
      successMessage = "utworzono nowego użytkownika; możesz się zalogować";
      break;
    case "user updated":
      statusCode = 200;
      successMessage = "dane użytkownika zaktualizowane";
      break;
    case "car updated":
      statusCode = 200;
      successMessage = "dane samochodu zaktualizowane";
      break;
    case "car created":
      statusCode = 201;
      successMessage = "dodano nowy samochód do bazy";
      break;
    case "transaction successful":
      statusCode = 200;
      successMessage = "zakup samochodu udany";
      break;
    default:
      statusCode = 200;
      successMessage = "niewyobrażalny sukces";
      break;
  }

  res
    .writeHead(statusCode, { "content-type": "Application/json" })
    .end(JSON.stringify({ message: successMessage }));
}

export async function writeToResponse(
  payload: ResponsePayload,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  let body;
  if (typeof payload === "string") {
    body = payload;
  } else {
    body = JSON.stringify(payload);
  }
  res.writeHead(200, { "Content-type": "Application/json" }).end(body);
}
