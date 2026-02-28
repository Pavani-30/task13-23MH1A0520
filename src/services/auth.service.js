const bcrypt = require("bcrypt");
const axios = require("axios");
const { Pool } = require("pg");
const redisClient = require("../config/redis");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} = require("../utils/jwt");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,   // must be "db"
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});


exports.register = async (email, password) => {
  const existing = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (existing.rows.length > 0) {
    throw new Error("User already exists");
  }

  const hashed = await bcrypt.hash(password, 12);

  const role = await pool.query(
    "SELECT id FROM roles WHERE name = 'USER'"
  );

  const newUser = await pool.query(
    "INSERT INTO users (email, password, role_id) VALUES ($1,$2,$3) RETURNING id,email",
    [email, hashed, role.rows[0].id]
  );

  return { user: newUser.rows[0] };
};


exports.login = async (email, password) => {
  const userResult = await pool.query(
    `SELECT users.id, users.email, users.password, roles.name as role
     FROM users
     LEFT JOIN roles ON users.role_id = roles.id
     WHERE users.email = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const user = userResult.rows[0];

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await redisClient.set(
    `refresh:${user.id}`,
    refreshToken,
    { EX: 7 * 24 * 60 * 60 }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
};


exports.refresh = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const stored = await redisClient.get(`refresh:${decoded.id}`);

  if (!stored || stored !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = generateAccessToken({
    id: decoded.id,
    role: "USER"
  });

  return { accessToken };
};


exports.logout = async (refreshToken) => {
  if (!refreshToken) return;

  const decoded = verifyRefreshToken(refreshToken);
  await redisClient.del(`refresh:${decoded.id}`);
};


async function upsertOAuthUser(email, provider, providerId) {
  let userResult = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  let user;

  if (userResult.rows.length === 0) {
    const role = await pool.query(
      "SELECT id FROM roles WHERE name = 'USER'"
    );

    const newUser = await pool.query(
      "INSERT INTO users (email, role_id) VALUES ($1,$2) RETURNING *",
      [email, role.rows[0].id]
    );

    user = newUser.rows[0];
  } else {
    user = userResult.rows[0];
  }

  await pool.query(
    `INSERT INTO auth_providers (user_id, provider, provider_user_id)
     VALUES ($1,$2,$3)
     ON CONFLICT (provider, provider_user_id) DO NOTHING`,
    [user.id, provider, providerId]
  );

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await redisClient.set(
    `refresh:${user.id}`,
    refreshToken,
    { EX: 7 * 24 * 60 * 60 }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email
    }
  };
}
exports.getGoogleAuthURL = () => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" ")
  };

  const queryString = new URLSearchParams(options).toString();

  return `${rootUrl}?${queryString}`;
};

exports.getGithubAuthURL = () => {
  const rootUrl = "https://github.com/login/oauth/authorize";

  const options = {
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    scope: "user:email"
  };

  const queryString = new URLSearchParams(options).toString();

  return `${rootUrl}?${queryString}`;
};

exports.handleGoogleCallback = async (code) => {
  const email = "googleuser@example.com";
  const provider = "google";
  const providerId = "google123";

  return await upsertOAuthUser(email, provider, providerId);
};

