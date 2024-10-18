import pkg from 'pg';
const { Pool } = pkg;

export const db = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'challenge_4',
  user: 'postgres',
  password: '1234'
})

