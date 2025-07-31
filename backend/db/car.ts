// this file probably needs to be smartly renamed
// to avoid confusion with routes/users.ts

import { ProductType, Car } from "../types";
import { UserRole } from "../types";
import path from "path";
import { generateId } from "./helperMethods";

import { getDataArray, writeDataArray } from "./jsondb";

const pathToCars = path.join(__dirname, "../../db/cars.json");

// CREATE
// are these two functions need to be separate?
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

export async function carModelExists(model: string): Promise<boolean> {
  try {
    const carsArray = await getCars();
    if (carsArray === null)
      throw new Error("cars data not available in carModelExists()");
    if (carsArray.find((car) => car.model === model) !== undefined) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

export async function carExists(id: string): Promise<boolean> {
  try {
    const carsArray = await getCars();
    if (carsArray === null)
      throw new Error("cars data not available in carExists()");
    if (carsArray.find((car) => car.id === id) !== undefined) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

export async function carIsAvailable(id: string): Promise<boolean> {
  try {
    const carsArray = await getCars();
    if (carsArray === null)
      throw new Error("cars data not available in carExists()");
    if (
      carsArray.find((car) => car.id === id && car.ownerId === null) !==
      undefined
    )
      return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

// READ single Car
export async function getCar(carId: string): Promise<Car | undefined | null> {
  try {
    const carsArray = await getDataArray<Car>(pathToCars);
    if (!carsArray) throw new Error("cars data not available");

    const car = carsArray.find((car) => car.id === carId);
    if (car === undefined) return undefined;

    return car;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function updateCarInDB(
  carId: string,
  updatedPrice: number | undefined,
  updatedUserId: string | null | undefined
): Promise<boolean> {
  try {
    const carsArray = await getCars();
    if (carsArray === null)
      throw new Error("cars data not available in writeUser()");

    const updatedCarsArray = carsArray.map((car) => {
      if (car.id === carId) {
        const updatedCar: Car = {
          id: car.id,
          model: car.model,
          price: updatedPrice === undefined ? car.price : updatedPrice,
          ownerId: updatedUserId === undefined ? car.ownerId : updatedUserId,
        };
        return updatedCar;
      } else return car;
    });

    if (await !writeDataArray<Car>(pathToCars, updatedCarsArray))
      throw new Error("unable to write cars in updateCarInDB()");
    return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}
