// run this file with tsx, to seed the database.

import { hashPassword } from '../utils/bcrypt.js';
import { db } from './client.js';
import { users } from './schema.js';

async function main() {
  console.log('Seeding started...');
  await db.insert(users).values([
    {
      name: 'Admin',
      username: 'admin',
      password: await hashPassword('Admin@1234'),
    },
    {
      name: 'User',
      username: 'user',
      password: await hashPassword('password'),
    },
  ]);
  console.log('Seeding finished!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
