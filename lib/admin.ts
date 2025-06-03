import { sql } from "./database"
import type { AdminRequest, Role, User } from "../types"

export async function createAdminRequest(email: string, name: string, reason?: string): Promise<AdminRequest | null> {
  try {
    const result = await sql`
      INSERT INTO admin_requests (email, name, reason)
      VALUES (${email}, ${name}, ${reason || null})
      RETURNING *
    `
    return result[0] as AdminRequest
  } catch (error) {
    console.error("Error creating admin request:", error)
    return null
  }
}

export async function getAdminRequests(status?: string): Promise<AdminRequest[]> {
  try {
    if (status) {
      const result = await sql`
        SELECT ar.*, u.name as reviewer_name
        FROM admin_requests ar
        LEFT JOIN users u ON ar.reviewed_by = u.id
        WHERE ar.status = ${status}
        ORDER BY ar.requested_at DESC
      `
      return result as AdminRequest[]
    } else {
      const result = await sql`
        SELECT ar.*, u.name as reviewer_name
        FROM admin_requests ar
        LEFT JOIN users u ON ar.reviewed_by = u.id
        ORDER BY ar.requested_at DESC
      `
      return result as AdminRequest[]
    }
  } catch (error) {
    console.error("Error getting admin requests:", error)
    return []
  }
}

export async function reviewAdminRequest(
  requestId: number,
  status: "approved" | "rejected",
  reviewerId: number,
): Promise<boolean> {
  try {
    await sql`
      UPDATE admin_requests 
      SET status = ${status}, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ${reviewerId}
      WHERE id = ${requestId}
    `
    return true
  } catch (error) {
    console.error("Error reviewing admin request:", error)
    return false
  }
}

export async function getRoles(): Promise<Role[]> {
  try {
    const result = await sql`
      SELECT * FROM roles
      ORDER BY level DESC, name ASC
    `
    return result as Role[]
  } catch (error) {
    console.error("Error getting roles:", error)
    return []
  }
}

export async function createRole(role: Omit<Role, "id" | "created_at" | "updated_at">): Promise<Role | null> {
  try {
    const result = await sql`
      INSERT INTO roles (name, description, permissions, level, created_by)
      VALUES (${role.name}, ${role.description || null}, ${JSON.stringify(role.permissions)}, ${role.level}, ${role.created_by})
      RETURNING *
    `
    return result[0] as Role
  } catch (error) {
    console.error("Error creating role:", error)
    return null
  }
}

export async function updateRole(roleId: number, updates: Partial<Role>): Promise<Role | null> {
  try {
    const result = await sql`
      UPDATE roles 
      SET 
        name = COALESCE(${updates.name || null}, name),
        description = COALESCE(${updates.description || null}, description),
        permissions = COALESCE(${updates.permissions ? JSON.stringify(updates.permissions) : null}, permissions),
        level = COALESCE(${updates.level || null}, level),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${roleId}
      RETURNING *
    `
    return result[0] as Role
  } catch (error) {
    console.error("Error updating role:", error)
    return null
  }
}

export async function deleteRole(roleId: number): Promise<boolean> {
  try {
    await sql`DELETE FROM roles WHERE id = ${roleId} AND name NOT IN ('admin', 'manager', 'member')`
    return true
  } catch (error) {
    console.error("Error deleting role:", error)
    return false
  }
}

export async function getUsersWithRoles(): Promise<User[]> {
  try {
    const result = await sql`
      SELECT u.*, r.name as role_name, r.description as role_description, r.permissions, r.level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY r.level DESC, u.name ASC
    `
    return result.map((row: any) => ({
      ...row,
      roleDetails: {
        id: row.role_id,
        name: row.role_name,
        description: row.role_description,
        permissions: row.permissions,
        level: row.level,
      },
    })) as User[]
  } catch (error) {
    console.error("Error getting users with roles:", error)
    return []
  }
}

export async function updateUserRole(userId: number, roleId: number): Promise<boolean> {
  try {
    await sql`
      UPDATE users 
      SET role_id = ${roleId}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `
    return true
  } catch (error) {
    console.error("Error updating user role:", error)
    return false
  }
}

export async function checkPermission(user: User, resource: string, action: string): Promise<boolean> {
  if (!user.roleDetails) return false

  const permissions = user.roleDetails.permissions

  // Admin has all permissions
  if (permissions.all === true) return true

  // Check specific resource permissions
  if (permissions[resource]) {
    if (permissions[resource].all === true) return true
    if (permissions[resource][action] === true) return true
  }

  return false
}
