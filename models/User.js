const { pool } = require("../db");
const tableName = "users";

class User {
  async getAllUsers() {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  }

  async getUserById(id) {
    const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
    return result.rows?.[0];
  }

  async getUserByPhone(phone) {
    const result = await pool.query(`SELECT * FROM ${tableName} WHERE phone = $1`, [phone]);
    return result.rows?.[0];
  }

  async getUserByEmail(email) {
    const result = await pool.query(`SELECT * FROM ${tableName} WHERE email = $1`, [email]);
    return result.rows?.[0];
  }

  async createUser({ username, password, email, phone, role }) {
    const result = await pool.query(
      `INSERT INTO ${tableName} (username, password, phone, email, role)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [username, password, phone, email, role || 10]
    );
    return result.rows?.[0];
  }

  async updateUser(id, { username, email, phone, role }) {
    const result = await pool.query(
      `UPDATE ${tableName} SET username=$1, email=$2, phone=$3, role=$4 WHERE id=$5 RETURNING *`,
      [username, email, phone, role, id]
    );
    return result.rows?.[0];
  }

  async deleteUser(id) {
    await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
    return true;
  }
  async updatePassword(id, hashedPassword) {
  const result = await pool.query(
    `UPDATE ${tableName} SET password=$1 WHERE id=$2 RETURNING *`,
    [hashedPassword, id]
  );
  return result.rows?.[0];
}

}

module.exports = new User();
