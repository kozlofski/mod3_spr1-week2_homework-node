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
