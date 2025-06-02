import { sql } from "./database"
import type { User } from "../types"
import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, name: string, password: string, role = "member"): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password)
    const result = await sql`
      INSERT INTO users (email, name, password_hash, role)
      VALUES (${email}, ${name}, ${hashedPassword}, ${role})
      RETURNING id, email, name, role, avatar_url, created_at, updated_at
    `
    return result[0] as User
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, role, avatar_url, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `
    return (result[0] as User) || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, password_hash, role, avatar_url, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `

    if (result.length === 0) return null

    const user = result[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) return null

    // Remove password_hash from returned user
    const { password_hash, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}
