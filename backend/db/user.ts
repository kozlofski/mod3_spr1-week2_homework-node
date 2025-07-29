// this file probably needs to be smartly renamed
// to avoid confusion with routes/users.ts

import { PublicUser, User } from "../types";
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

// READ for User
export async function getUsers(): Promise<User[] | null> {
  try {
    const usersArray = await getDataArray<User>(pathToUsers);
    if (!usersArray) throw new Error("users data not available");
    return usersArray;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// READ single User
export async function getUser(
  userId: string
): Promise<PublicUser | undefined | null> {
  try {
    const usersArray = await getDataArray<User>(pathToUsers);
    if (!usersArray) throw new Error("users data not available");

    const user = usersArray.find((user) => user.id === userId);
    if (user === undefined) return undefined;

    const publicUser: PublicUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      balance: user.balance,
    };
    return publicUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// lower layer of abstraction - generic fn for CRUD interaction
// with JSON files
// in future to be replaced by real DB
// or another layer there will be
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
