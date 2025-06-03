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

    // Get the role ID for the specified role
    const roleResult = await sql`SELECT id FROM roles WHERE name = ${role}`
    const roleId = roleResult[0]?.id || 4 // Default to member role (id: 4)

    const result = await sql`
      INSERT INTO users (email, name, password_hash, role, role_id)
      VALUES (${email}, ${name}, ${hashedPassword}, ${role}, ${roleId})
      RETURNING id, email, name, role, role_id, avatar_url, created_at, updated_at
    `

    // Get role details
    const userWithRole = await getUserWithRoleDetails(result[0].id)
    return userWithRole
  } catch (error) {
    console.error("Error creating user:", error)
    return null
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, role, role_id, avatar_url, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `

    if (result.length === 0) return null

    const userWithRole = await getUserWithRoleDetails(result[0].id)
    return userWithRole
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT id, email, name, password_hash, role, role_id, avatar_url, created_at, updated_at
      FROM users 
      WHERE email = ${email}
    `

    if (result.length === 0) return null

    const user = result[0]
    const isValid = await verifyPassword(password, user.password_hash)

    if (!isValid) return null

    // Get user with role details
    const userWithRole = await getUserWithRoleDetails(user.id)
    return userWithRole
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

async function getUserWithRoleDetails(userId: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT u.*, r.name as role_name, r.description as role_description, 
             r.permissions, r.level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ${userId}
    `

    if (result.length === 0) return null

    const row = result[0]
    return {
      ...row,
      roleDetails: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
        permissions: row.permissions,
        level: row.level,
        created_at: "",
        updated_at: "",
      },
    } as User
  } catch (error) {
    console.error("Error getting user with role details:", error)
    return null
  }
}
