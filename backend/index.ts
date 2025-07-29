import { createServer } from "http";
import fs from "fs/promises";
import path, { dirname } from "path";
import url from "url";

import { getStaticFile, staticPaths } from "./routes/staticFiles";
import { users, login, register } from "./routes/users";
import { addCar, cars } from "./routes/cars";
import { buyCar } from "./routes/transactions";

const PORT = 3000;

const server = createServer(async (req, res) => {
  const method = req.method;
  const reqUrl = url.parse(req.url || "", true);
  const pathName = reqUrl.pathname;
  console.log(`-> REQUEST:\nendpoint: ${pathName}\nmethod: ${method}\n`);

  // serving basic static files
  if (method === "GET" && pathName && staticPaths.includes(pathName))
    getStaticFile(pathName, res);

  // users
  if (method === "GET" && pathName === "/users") users(req, res);

  // login form
  if (method === "POST" && pathName === "/login") login(req, res);

  //register new user
  if (method === "POST" && pathName === "/register") register(req, res);

  // //update existing user
  // if (method === "PUT" && pathName?.startsWith("/users/"))
  //   updateUser(req, res, pathName);

  // adding a new car
  if (method === "POST" && pathName === "/cars") addCar(req, res);

  // get cars
  if (method === "GET" && pathName === "/cars") cars(req, res);

  // buy a car
  if (
    method === "POST" &&
    pathName?.startsWith("/cars") &&
    pathName.endsWith("/buy")
  )
    buyCar(pathName, req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
