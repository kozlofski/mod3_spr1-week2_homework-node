import { User } from "../types";
import path from "path";

import fs from "fs/promises";

const pathToUsers = path.join(__dirname, "../../db/users.json");

export async function verifyUser(
  username: string,
  password: string
): Promise<string | undefined> {
  const usersArray = await getUsers();
  if (usersArray === undefined) return undefined;
  const foundUser: User | undefined = usersArray.find(
    (user: User) => user.username === username && user.password === password
  );
  return foundUser?.id;
}

// "private" helper methods:

async function getUsers(): Promise<User[] | undefined> {
  try {
    const users = await fs.readFile(pathToUsers);
    if (!users) return undefined;
    // users is sometimes undefined and doesn't throw an error...
    const usersArray = await JSON.parse(users.toString());
    return usersArray;
  } catch (error) {
    console.log(error);
    return undefined;
  }
}
