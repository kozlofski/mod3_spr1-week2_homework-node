export interface User {
  id: string;
  username: string;
  password: string; // Dla uproszczenia przechowujemy hasło w postaci jawnej (w praktyce należy stosować hashowanie)
  role: UserRole;
  balance: number;
}

export type UserRole = "user" | "admin";

export interface Car {
  id: string;
  model: string;
  price: number;
  ownerId: string | null;
}

export type ProductType = "car";

export type PublicUser = Omit<User, "password">;

export type ErrorToResponse =
  | "authorization failed"
  | "access forbidden"
  | "internal server error"
  | "login failed"
  | "validation error"
  | "username taken"
  | "car model already exists"
  | "not enough money"
  | "car already bought"
  | "car doesn't exist"
  | "server error; car wasn't created"
  | "server error; user wasn't created"
  | "car data unavailable"
  | "user data unavailable";

export type SuccessToResponse =
  | "login successful"
  | "user created"
  | "user updated"
  | "car created"
  | "transaction successful";

export type ErrorToBackend =
  | "user not found"
  | "user data not found"
  | "car data not found";

export type ResponsePayload =
  | Car[]
  | User[]
  | string
  | Record<string, string | number>;
