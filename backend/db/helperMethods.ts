import { UserRole, ProductType } from "../types";
import bcrypt from "bcrypt";

export async function generateId(
  name: string,
  dataType: UserRole | ProductType
): Promise<string> {
  const hashed = await bcrypt.hash(`${name}${dataType}`, 10);
  const id = `${dataType}-${hashed.slice(-6)}`;
  return id;
}
