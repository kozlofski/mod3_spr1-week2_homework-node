import { IncomingMessage, ServerResponse } from "http";
import { ErrorToResponse } from "../types";

export function handleErrorResponse(
  error: ErrorToResponse,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
): void {
  let statusCode: number;
  let errorMessage: string;

  switch (error) {
    case "authorization failed":
      statusCode = 401;
      errorMessage = "operacja wymaga uwierzytelnienia; zaloguj się";
      break;
    case "access forbidden":
      statusCode = 403;
      errorMessage = "brak dostępu";
      break;
    case "login failed":
      statusCode = 401;
      errorMessage = "logowanie nieudane";
      break;
    case "validation error":
      statusCode = 400;
      errorMessage = "walidacja: nieprawidłowa nazwa użytkownika lub hasła";
      break;
    case "username taken":
      statusCode = 400;
      errorMessage = "nazwa użytkownika zajęta";
      break;
    case "car model already exists":
      statusCode = 400;
      errorMessage = "ten model samochodu już istnieje w bazie";
      break;
    case "not enough money":
      statusCode = 400;
      errorMessage = "masz za mało środków, żeby kupić ten samochód";
      break;
    case "car already bought":
      statusCode = 400;
      errorMessage = "ten samochód został już kupiony";
      break;
    case "car doesn't exist":
      statusCode = 400;
      errorMessage = "samochód o tym ID nie istnieje w bazie";
      break;
    case "internal server error":
      statusCode = 500;
      errorMessage = "nieznany błąd";
      break;
    case "server error; car wasn't created":
      statusCode = 500;
      errorMessage = "błąd serwera; samochodu nie dodano do bazy";
      break;
    case "server error; user wasn't created":
      statusCode = 500;
      errorMessage = "błąd serwera; nie utworzono użytkownika";
      break;
    case "car data unavailable":
      statusCode = 500;
      errorMessage =
        "błąd serwera; nie udało się załadować danych o samochodach";
      break;
    case "user data unavailable":
      statusCode = 500;
      errorMessage =
        "błąd serwera; nie udało się załadować danych o użytkowniku";
      break;
    default:
      statusCode = 500;
      errorMessage = "błąd serwera";
      break;
  }

  res
    .writeHead(statusCode, { "content-type": "Application/json" })
    .end(JSON.stringify({ error: errorMessage }));
}
