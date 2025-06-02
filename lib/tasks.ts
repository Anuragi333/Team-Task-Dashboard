import { sql } from "./database"
import type { Task, Milestone, Comment, TaskHistory } from "../types"

export async function getTasks(teamId?: number, userId?: number): Promise<Task[]> {
  try {
    let result

    // Handle different query conditions with complete tagged template queries
    if (teamId && userId) {
      result = await sql`
        SELECT 
          t.*,
          u1.name as assigned_user_name,
          u1.email as assigned_user_email,
          u2.name as created_user_name,
          u2.email as created_user_email
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        WHERE t.team_id = ${teamId} AND (t.assigned_to = ${userId} OR t.created_by = ${userId})
        ORDER BY t.created_at DESC
      `
    } else if (teamId) {
      result = await sql`
        SELECT 
          t.*,
          u1.name as assigned_user_name,
          u1.email as assigned_user_email,
          u2.name as created_user_name,
          u2.email as created_user_email
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        WHERE t.team_id = ${teamId}
        ORDER BY t.created_at DESC
      `
    } else if (userId) {
      result = await sql`
        SELECT 
          t.*,
          u1.name as assigned_user_name,
          u1.email as assigned_user_email,
          u2.name as created_user_name,
          u2.email as created_user_email
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        WHERE t.assigned_to = ${userId} OR t.created_by = ${userId}
        ORDER BY t.created_at DESC
      `
    } else {
      result = await sql`
        SELECT 
          t.*,
          u1.name as assigned_user_name,
          u1.email as assigned_user_email,
          u2.name as created_user_name,
          u2.email as created_user_email
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.created_by = u2.id
        ORDER BY t.created_at DESC
      `
    }

    return result.map((row: any) => ({
      ...row,
      assigned_user: row.assigned_user_name
        ? {
            id: row.assigned_to,
            name: row.assigned_user_name,
            email: row.assigned_user_email,
          }
        : null,
      created_user: {
        id: row.created_by,
        name: row.created_user_name,
        email: row.created_user_email,
      },
    })) as Task[]
  } catch (error) {
    console.error("Error getting tasks:", error)
    return []
  }
}

export async function createTask(task: Omit<Task, "id" | "created_at" | "updated_at">): Promise<Task | null> {
  try {
    const result = await sql`
      INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, team_id, due_date)
      VALUES (${task.title}, ${task.description || null}, ${task.status}, ${task.priority}, 
              ${task.assigned_to || null}, ${task.created_by}, ${task.team_id}, ${task.due_date || null})
      RETURNING *
    `

    // Log task creation
    await logTaskHistory(result[0].id, task.created_by, "created", null, `Task "${task.title}" created`)

    return result[0] as Task
  } catch (error) {
    console.error("Error creating task:", error)
    return null
  }
}

export async function updateTask(id: number, updates: Partial<Task>, userId: number): Promise<Task | null> {
  try {
    // Get current task for history logging
    const currentTask = await sql`SELECT * FROM tasks WHERE id = ${id}`
    if (currentTask.length === 0) return null

    const current = currentTask[0]

    // Build update object
    const updateData: any = { updated_at: new Date() }

    // Only include valid fields that have changed
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== "id" && key !== "created_at" && value !== undefined && current[key] !== value) {
        updateData[key] = value
        // Log the change
        logTaskHistory(id, userId, `updated_${key}`, String(current[key]), String(value))
      }
    })

    // If no changes, return current task
    if (Object.keys(updateData).length === 1) return current as Task

    // Perform the update using individual field updates
    let result
    if (updates.status) {
      result = await sql`
        UPDATE tasks 
        SET status = ${updates.status}, 
            completed_at = ${updates.status === "Completed" ? new Date() : null},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} 
        RETURNING *
      `
    } else if (updates.priority) {
      result = await sql`
        UPDATE tasks 
        SET priority = ${updates.priority}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} 
        RETURNING *
      `
    } else if (updates.assigned_to !== undefined) {
      result = await sql`
        UPDATE tasks 
        SET assigned_to = ${updates.assigned_to}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} 
        RETURNING *
      `
    } else {
      // For other updates, handle them generically
      result = await sql`
        UPDATE tasks 
        SET title = COALESCE(${updates.title}, title),
            description = COALESCE(${updates.description}, description),
            due_date = COALESCE(${updates.due_date}, due_date),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id} 
        RETURNING *
      `
    }

    return result[0] as Task
  } catch (error) {
    console.error("Error updating task:", error)
    return null
  }
}

export async function deleteTask(id: number, userId: number): Promise<boolean> {
  try {
    await logTaskHistory(id, userId, "deleted", null, "Task deleted")
    await sql`DELETE FROM tasks WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting task:", error)
    return false
  }
}

export async function getMilestones(taskId: number): Promise<Milestone[]> {
  try {
    const result = await sql`
      SELECT * FROM milestones 
      WHERE task_id = ${taskId} 
      ORDER BY order_index ASC
    `
    return result as Milestone[]
  } catch (error) {
    console.error("Error getting milestones:", error)
    return []
  }
}

export async function createMilestone(
  milestone: Omit<Milestone, "id" | "created_at" | "updated_at">,
): Promise<Milestone | null> {
  try {
    const result = await sql`
      INSERT INTO milestones (task_id, title, completed, due_date, order_index)
      VALUES (${milestone.task_id}, ${milestone.title}, ${milestone.completed}, 
              ${milestone.due_date || null}, ${milestone.order_index})
      RETURNING *
    `
    return result[0] as Milestone
  } catch (error) {
    console.error("Error creating milestone:", error)
    return null
  }
}

export async function updateMilestone(id: number, updates: Partial<Milestone>): Promise<Milestone | null> {
  try {
    // Get current milestone
    const currentMilestone = await sql`SELECT * FROM milestones WHERE id = ${id}`
    if (currentMilestone.length === 0) return null

    // Handle different update scenarios with tagged templates
    let result

    if (updates.completed !== undefined) {
      result = await sql`
        UPDATE milestones 
        SET completed = ${updates.completed},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    } else if (updates.order_index !== undefined) {
      result = await sql`
        UPDATE milestones 
        SET order_index = ${updates.order_index},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    } else if (updates.title) {
      result = await sql`
        UPDATE milestones 
        SET title = ${updates.title},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    } else if (updates.due_date) {
      result = await sql`
        UPDATE milestones 
        SET due_date = ${updates.due_date},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    } else {
      // No valid updates
      return currentMilestone[0] as Milestone
    }

    return result[0] as Milestone
  } catch (error) {
    console.error("Error updating milestone:", error)
    return null
  }
}

export async function deleteMilestone(id: number): Promise<boolean> {
  try {
    await sql`DELETE FROM milestones WHERE id = ${id}`
    return true
  } catch (error) {
    console.error("Error deleting milestone:", error)
    return false
  }
}

export async function getComments(taskId: number): Promise<Comment[]> {
  try {
    const result = await sql`
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ${taskId}
      ORDER BY c.created_at DESC
    `
    return result.map((row: any) => ({
      ...row,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
      },
    })) as Comment[]
  } catch (error) {
    console.error("Error getting comments:", error)
    return []
  }
}

export async function createComment(
  comment: Omit<Comment, "id" | "created_at" | "updated_at">,
): Promise<Comment | null> {
  try {
    const result = await sql`
      INSERT INTO comments (task_id, user_id, content)
      VALUES (${comment.task_id}, ${comment.user_id}, ${comment.content})
      RETURNING *
    `
    return result[0] as Comment
  } catch (error) {
    console.error("Error creating comment:", error)
    return null
  }
}

export async function logTaskHistory(
  taskId: number,
  userId: number,
  action: string,
  oldValue?: string,
  newValue?: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO task_history (task_id, user_id, action, old_value, new_value)
      VALUES (${taskId}, ${userId}, ${action}, ${oldValue || null}, ${newValue || null})
    `
  } catch (error) {
    console.error("Error logging task history:", error)
  }
}

export async function getTaskHistory(taskId: number): Promise<TaskHistory[]> {
  try {
    const result = await sql`
      SELECT th.*, u.name as user_name, u.email as user_email
      FROM task_history th
      LEFT JOIN users u ON th.user_id = u.id
      WHERE th.task_id = ${taskId}
      ORDER BY th.created_at DESC
    `
    return result.map((row: any) => ({
      ...row,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
      },
    })) as TaskHistory[]
  } catch (error) {
    console.error("Error getting task history:", error)
    return []
  }
}
