import path from "path";
import { generateId } from "./helperMethods";

import { PublicUser, User, UserRole } from "../types";
import { getDataArray, writeDataArray } from "./jsondb";

const pathToUsers = path.join(__dirname, "../../db/users.json");

// CREATE new User
export async function createUser(
  newUserUsername: string,
  newUserPassword: string,
  newUserRole: UserRole
): Promise<boolean> {
  try {
    const usersArray = await getUsers();
    if (usersArray === null)
      throw new Error("users data not available in writeUser()");

    const newUserId = await generateId(newUserUsername, newUserRole);
    const newUser: User = {
      id: newUserId,
      username: newUserUsername,
      password: newUserPassword,
      role: newUserRole,
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

// UPDATE User
export async function editUser(
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

    if (await !writeDataArray<User>(pathToUsers, updatedUsersArray))
      throw new Error("unable to write users in updateUserInDB()");
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

// DELETE User
export async function removeUser(userId: string): Promise<boolean> {
  try {
    const usersArray = await getUsers();
    if (usersArray === null)
      throw new Error("users data not available in deleteUser()");

    const updatedUsersArray = usersArray.filter((user) => user.id !== userId);

    if (updatedUsersArray.length === 0)
      throw new Error("can't delete last user - probably admin's account");

    if (await !writeDataArray<User>(pathToUsers, updatedUsersArray))
      throw new Error("unable to write users in writeUser()");
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

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

// GETTERS
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
