import { IncomingMessage, ServerResponse } from "http";
import { transactionEventBus } from "./transactions";
import { SSEEvent } from "../types";

const clients: (ServerResponse<IncomingMessage> & { req: IncomingMessage })[] =
  [];

export function setupSSE(
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage }
) {
  console.log("SSE opened");
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  clients.push(res);

  function sendTransactionEvent(data: string): void {
    console.log("Data sent by SSE:", data);
    for (const r of clients) r.write(data);
  }

  transactionEventBus.on("car bought", sendTransactionEvent);

  req.on("close", () => {
    clients.splice(clients.indexOf(res), 1);
    transactionEventBus.removeListener("newEvent", sendTransactionEvent);
    res.end();
    console.log("SSE closed");
  });
}

export function handleSSE(event: SSEEvent, data: Record<string, string>) {
  const stringifiedData = JSON.stringify(data);
  transactionEventBus.emit(event, `data: ${stringifiedData}\n\n`);
}
