import { createServer } from "http";
import fs from "fs/promises";
import path, { dirname } from "path";
import url from "url";
// import http from "http";

import {
  serveStaticFiles,
  login,
  users,
  register,
  updateUser,
  addCar,
} from "./routes";

const PORT = 3000;
// const scriptPath =

const server = createServer(async (req, res) => {
  const method = req.method;
  const reqUrl = url.parse(req.url || "", true);
  const pathName = reqUrl.pathname;
  console.log("Endpoint:", pathName, "method:", method);

  // serving basic static files
  const staticPaths = [
    "/",
    "/static/main.js",
    "/static/style.css",
    "/favicon.ico",
  ];
  if (method === "GET" && pathName && staticPaths.includes(pathName))
    serveStaticFiles(pathName, res);

  // login form
  if (method === "POST" && pathName === "/login") login(req, res);

  // users
  if (method === "GET" && pathName === "/users") users(req, res);

  //register new user
  if (method === "POST" && pathName === "/register") register(req, res);

  //update existing user
  if (method === "PUT" && pathName?.startsWith("/users/"))
    updateUser(req, res, pathName);

  // adding a new car
  if (method === "POST" && pathName === "/cars") addCar(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
