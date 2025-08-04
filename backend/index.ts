import { createServer } from "http";
import url from "url";

import { getStaticFile, staticPaths } from "./routes/staticFiles";
import {
  users,
  login,
  register,
  updateUsernameOrPassword,
  deleteUser,
  hackBalance,
} from "./routes/users";
import { createCar, cars, deleteCar, updatePriceOrUser } from "./routes/cars";
import { buyCar } from "./routes/transactions";
import { setupSSE } from "./routes/sse";

const PORT = 3000;

const server = createServer(async (req, res) => {
  const method = req.method;
  const reqUrl = url.parse(req.url || "", true);
  const pathName = reqUrl.pathname;
  console.log(`-> REQUEST:\nendpoint: ${pathName}\nmethod: ${method}\n`);

  // serving basic static files
  if (method === "GET" && pathName && staticPaths.includes(pathName))
    getStaticFile(pathName, res);

  // === CRUD for users ===
  // CREATE (register) new user
  if (method === "POST" && pathName === "/register") register(req, res);

  // READ users
  if (method === "GET" && pathName === "/users") users(req, res);

  // UPDATE existing user
  if (method === "PUT" && pathName?.startsWith("/users/"))
    updateUsernameOrPassword(pathName, req, res);

  // DELETE existing user
  if (method === "DELETE" && pathName?.startsWith("/users/"))
    deleteUser(pathName, req, res);

  // login form
  if (method === "POST" && pathName === "/login") login(req, res);

  // === CRUD for cars ===
  // CREATE a new car
  if (method === "POST" && pathName === "/cars") createCar(req, res);

  // READ cars
  if (method === "GET" && pathName === "/cars") cars(req, res);

  // UPDATE car
  if (method === "PUT" && pathName?.startsWith("/cars/"))
    updatePriceOrUser(pathName, req, res);

  // DELETE car
  if (method === "DELETE" && pathName?.startsWith("/cars/"))
    deleteCar(pathName, req, res);

  // === TRANSACTIONS ===
  // buy a car
  if (
    method === "POST" &&
    pathName?.startsWith("/cars") &&
    pathName.endsWith("/buy")
  )
    buyCar(pathName, req, res);

  // server-side events
  if (req.url === "/sse") setupSSE(req, res);

  // hacking balance
  if (req.url === "/gumowa-kaczka" && pathName) hackBalance(pathName, req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
