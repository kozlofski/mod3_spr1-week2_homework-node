// this file probably needs to be smartly renamed
// to avoid confusion with routes/users.ts

import { ProductType, Car } from "../types";
import { UserRole } from "../types";
import path from "path";
import bcrypt from "bcrypt";

import { getDataArray, writeDataArray } from "./jsondb";

const pathToCars = path.join(__dirname, "../../db/cars.json");

export async function createCar(
  newCarModel: string,
  newCarPrice: string
): Promise<boolean> {
  try {
    const newCarId = await generateId(newCarModel, "car");
    if (await !writeCar(newCarId, newCarModel, newCarPrice))
      throw new Error("unable to write new car");
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

async function writeCar(
  id: string,
  model: string,
  price: string
): Promise<boolean> {
  try {
    const carsArray = await getCars();
    if (carsArray === null)
      throw new Error("cars data not available in writeUser()");

    const newCar: Car = {
      id: id,
      model: model,
      price: parseFloat(price),
      ownerId: null,
    };

    const updatedCarsArray = [...carsArray, newCar];
    if (await !writeDataArray<Car>(pathToCars, updatedCarsArray))
      throw new Error("unable to write cars in writeCar()");
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

// READ all Cars
export async function getCars(): Promise<Car[] | null> {
  try {
    const carsArray = await getDataArray<Car>(pathToCars);
    if (!carsArray) throw new Error("cars data not available");
    return carsArray;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function carExists(model: string): Promise<boolean> {
  try {
    const carsArray = await getCars();
    if (carsArray === null)
      throw new Error("cars data not available in carExists()");
    if (carsArray.find((car) => car.model === model) !== undefined) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

// // READ single User
// export async function getUser(
//   userId: string
// ): Promise<PublicUser | undefined | null> {
//   try {
//     const usersArray = await getDataArray<User>(pathToUsers);
//     if (!usersArray) throw new Error("users data not available");

//     const user = usersArray.find((user) => user.id === userId);
//     if (user === undefined) return undefined;

//     const publicUser: PublicUser = {
//       id: user.id,
//       username: user.username,
//       role: user.role,
//       balance: user.balance,
//     };
//     return publicUser;
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// }

// // === helper functions (private) ===

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
