import bcryptjs from 'bcryptjs';
import { createClient } from '@neondatabase/serverless';

const email = 'anuragiananya@gmail.com';
const newPassword = 'AdminReset2026!';

async function resetPassword() {
  try {
    // Generate bcrypt hash
    console.log(`[v0] Generating bcrypt hash for new password...`);
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(newPassword, saltRounds);
    console.log(`[v0] Password hash generated successfully`);
    
    // Connect to database
    console.log(`[v0] Connecting to database...`);
    const sql = createClient({
      connectionString: process.env.DATABASE_URL,
    });

    // Update password
    console.log(`[v0] Updating password for ${email}...`);
    const result = await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}
      WHERE email = ${email}
      RETURNING id, email, name;
    `;

    if (result.length === 0) {
      console.log(`[v0] ERROR: User not found with email ${email}`);
      process.exit(1);
    }

    const user = result[0];
    console.log(`\n✅ PASSWORD RESET SUCCESSFUL\n`);
    console.log(`User: ${user.name} (${user.email})`);
    console.log(`User ID: ${user.id}`);
    console.log(`\nNew temporary password: ${newPassword}`);
    console.log(`\n⚠️  Please change this password immediately after logging in for security.`);
    
    process.exit(0);
  } catch (error) {
    console.error(`[v0] ERROR: ${error.message}`);
    process.exit(1);
  }
}

resetPassword();
