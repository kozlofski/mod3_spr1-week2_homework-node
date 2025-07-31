// this file probably needs to be smartly renamed
// to avoid confusion with routes/users.ts

import { PublicUser, User, UserRole, ProductType } from "../types";
import path from "path";
import bcrypt from "bcrypt";

import { getDataArray, writeDataArray } from "./jsondb";

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
    if (await !writeDataArray<User>(pathToUsers, updatedUsersArray))
      throw new Error("unable to write users in writeUser()");
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

export async function updateUserInDB(
  id: string,
  updatedUsername: string | undefined,
  updatedPassword: string | undefined,
  updatedBalance: number | undefined
): Promise<boolean> {
  try {
    const usersArray = await getUsers();
    if (usersArray === null)
      throw new Error("users data not available in writeUser()");

    const updatedUsersArray = usersArray.map((user) => {
      if (user.id === id) {
        const updatedUser: User = {
          id: user.id,
          username:
            updatedUsername === undefined ? user.username : updatedUsername,
          password:
            updatedPassword === undefined ? user.password : updatedPassword,
          role: user.role,
          balance: updatedBalance === undefined ? user.balance : updatedBalance,
        };
        return updatedUser;
      } else return user;
    });
    // console.log("Updated users", updatedUsersArray);

    if (await !writeDataArray<User>(pathToUsers, updatedUsersArray))
      throw new Error("unable to write users in updateUserInDB()");
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

// )

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
