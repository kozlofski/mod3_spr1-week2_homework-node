// this file probably needs to be smartly renamed
// to avoid confusion with routes/users.ts

import { PublicUser, User, UserRole, ProductType } from "../types";
import path from "path";
import bcrypt from "bcrypt";

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

export async function createUser(
  newUserUsername: string,
  newUserPassword: string,
  newUserRole: UserRole
): Promise<boolean> {
  try {
    const newUserId = await generateId(newUserUsername, newUserRole);
    if (
      await !writeUser(newUserId, newUserUsername, newUserPassword, newUserRole)
    )
      throw new Error("unable to write new user");
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

async function writeUser(
  id: string,
  username: string,
  password: string,
  role: UserRole
): Promise<boolean> {
  try {
    const usersArray = await getUsers();
    if (usersArray === null)
      throw new Error("users data not available in writeUser()");

    const newUser: User = {
      id: id,
      username: username,
      password: password,
      role: role,
      balance: 0,
    };
    const updatedUsersArray = [...usersArray, newUser];
    if (await !writeDataArray<User>(updatedUsersArray))
      throw new Error("unable to write users in writeUser()");
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

async function writeDataArray<T>(dataArray: T[]): Promise<boolean> {
  try {
    await fs.writeFile(pathToUsers, Buffer.from(JSON.stringify(dataArray)));
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

// READ all Users
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

export async function userExists(username: string): Promise<boolean> {
  try {
    const usersArray = await getUsers();
    if (usersArray === null)
      throw new Error("users data not available in userExists()");
    if (usersArray.find((user) => user.username === username) !== undefined)
      return true;
  } catch (error) {
    console.log(error);
  }
  return false;
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

// === helper functions (private) ===
// maybe move to separate module

async function generateId(
  username: string,
  role: UserRole | ProductType
): Promise<string> {
  const hashed = await bcrypt.hash(`${username}${role}`, 10);
  const id = `${role}-${hashed.slice(-6)}`;
  console.log(id);
  return id;
}
