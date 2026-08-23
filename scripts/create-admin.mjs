/**
 * UPSC NewsHub AI — One-Time Initial Administrator Setup CLI
 * 
 * Usage:
 *   npm run create-admin
 */
import readline from 'readline';
import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Client } = pg;

const DB_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/upscnewshub';

function ask(question, hideInput = false) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    if (hideInput && process.stdin.isTTY) {
      process.stdout.write(question);
      let input = '';
      const onData = (char) => {
        const c = char.toString();
        if (c === '\n' || c === '\r' || c === '\u0004') {
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(input);
        } else if (c === '\u0008' || c === '\x7f') {
          if (input.length > 0) {
            input = input.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          input += c;
          process.stdout.write('*');
        }
      };
      process.stdin.on('data', onData);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log('\n============================================================');
  console.log('🏛️  UPSC NewsHub AI — Initial Administrator Setup');
  console.log('============================================================\n');

  const client = new Client({ connectionString: DB_URL });

  try {
    await client.connect();
  } catch (err) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message);
    console.error('   Make sure Docker PostgreSQL container is running on localhost:5432.\n');
    process.exit(1);
  }

  try {
    // 1. Check if an ADMIN already exists in the database
    const adminCheck = await client.query(
      "SELECT id, name, email FROM users WHERE role = 'ADMIN' LIMIT 1"
    );

    if (adminCheck.rows.length > 0) {
      console.log('❌ An administrator already exists.');
      console.log(`   Registered Admin: ${adminCheck.rows[0].email}`);
      console.log('   Initial admin setup has already been completed.\n');
      await client.end();
      process.exit(1);
    }

    // 2. Prompt interactively for credentials
    let name = '';
    while (!name) {
      name = (await ask('Admin name: ')).trim();
      if (!name) console.log('   ⚠️  Name cannot be empty.');
    }

    let email = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    while (!email || !emailRegex.test(email)) {
      email = (await ask('Admin email: ')).trim().toLowerCase();
      if (!email || !emailRegex.test(email)) {
        console.log('   ⚠️  Please enter a valid email address.');
      }
    }

    let password = '';
    let confirmPassword = '';
    while (true) {
      password = await ask('Admin password: ', true);
      if (password.length < 6) {
        console.log('   ⚠️  Password must be at least 6 characters long.');
        continue;
      }

      confirmPassword = await ask('Confirm password: ', true);
      if (password !== confirmPassword) {
        console.log('   ⚠️  Passwords do not match. Please try again.\n');
        continue;
      }
      break;
    }

    // 3. Hash password using BCrypt
    console.log('\n🔒 Securing credentials with BCrypt...');
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    // 4. Check if the user already exists as an Aspirant and promote them, or create fresh
    const existingUser = await client.query(
      'SELECT id FROM users WHERE LOWER(email) = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query(
        "UPDATE users SET name = $1, password_hash = $2, role = 'ADMIN', updated_at = NOW() WHERE id = $3",
        [name, passwordHash, existingUser.rows[0].id]
      );
    } else {
      await client.query(
        "INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, $3, 'ADMIN', NOW(), NOW())",
        [name, email, passwordHash]
      );
    }

    console.log('\n============================================================');
    console.log('✅ Administrator account created successfully!');
    console.log('============================================================');
    console.log(`  Name:  ${name}`);
    console.log(`  Email: ${email}`);
    console.log(`  Role:  ADMIN`);
    console.log('\nYou can now sign in at: http://localhost:5173/login\n');

  } catch (err) {
    console.error('❌ Error creating administrator:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
