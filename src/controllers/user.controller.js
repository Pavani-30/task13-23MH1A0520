const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT users.id, users.email, roles.name as role
       FROM users
       LEFT JOIN roles ON users.role_id = roles.id
       WHERE users.id = $1`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

    const updated = await pool.query(
      "UPDATE users SET email = $1 WHERE id = $2 RETURNING id, email",
      [email, userId]
    );

    res.json(updated.rows[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
      `SELECT users.id, users.email, roles.name as role
       FROM users
       LEFT JOIN roles ON users.role_id = roles.id`
    );

    res.json(users.rows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};