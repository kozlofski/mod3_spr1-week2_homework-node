// this file probably needs to be smartly renamed
// to avoid confusion with routes/users.ts

import { User } from "../types";
import path from "path";

import fs from "fs/promises";

const pathToUsers = path.join(__dirname, "../../db/users.json");

export async function verifyUser(
  username: string,
  password: string
): Promise<string | undefined> {
  const usersArray = await getUsers();
  if (usersArray === null) return undefined;
  const foundUser: User | undefined = usersArray.find(
    (user: User) => user.username === username && user.password === password
  );
  return foundUser?.id;
}

// "private" helper methods:

async function getUsers(): Promise<User[] | null> {
  try {
    const usersArray = await getDataArray<User>(pathToUsers);
    if (!usersArray) throw new Error("users data not available");
    return usersArray;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function getDataArray<T>(path: string): Promise<T[] | null> {
  try {
    const fileData = await fs.readFile(path);
    const dataArray = JSON.parse(fileData.toString());
    return dataArray;
  } catch (error) {
    console.log(error);
    return null;
  }
}
