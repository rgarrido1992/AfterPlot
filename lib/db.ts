import { Pool, QueryResult, QueryResultRow } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  return pool.query(text, params)
}

export async function getUser(id: string) {
  const result = await query(
    'SELECT id, email, username, avatar_url, banner_url, bio FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

export async function getUserByEmail(email: string) {
  const result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )
  return result.rows[0]
}

export async function createUser(
  email: string,
  passwordHash: string,
  username: string,
  verificationToken: string
) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const result = await query(
    `INSERT INTO users (email, password_hash, username, verification_token, verification_token_expires_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, username`,
    [email, passwordHash, username, verificationToken, expiresAt]
  )
  return result.rows[0]
}

export async function verifyUser(email: string, token: string) {
  // In development, allow any token
  const condition = process.env.NODE_ENV === 'development'
    ? 'email = $1'
    : 'email = $1 AND verification_token = $2 AND verification_token_expires_at > NOW()'

  const params = process.env.NODE_ENV === 'development' ? [email] : [email, token]

  const result = await query(
    `UPDATE users
     SET is_verified = true, verification_token = null, verification_token_expires_at = null
     WHERE ${condition}
     RETURNING id, email, username`,
    params
  )
  return result.rows[0]
}

export async function deleteUnverifiedUsers() {
  const result = await query(
    `DELETE FROM users
     WHERE is_verified = false AND created_at < NOW() - INTERVAL '24 hours'`
  )
  return result.rowCount
}
