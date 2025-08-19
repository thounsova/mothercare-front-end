// lib/session.ts
export type Role = "admin" | "educator" | "parent";

export interface User {
  name: string;
  role: Role;
}

export async function getCurrentUser(): Promise<User> {
  // Demo user role: change to "educator" or "parent" to test
  return { name: "Thoun SOVANNAREACH", role: "admin" };
}
