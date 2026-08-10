const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, firstName, lastName, age, gender } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, age, gender)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, first_name, last_name, age, gender, created_at`,
      [email, passwordHash, firstName, lastName, age, gender]
    );

    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      'SELECT id, email, first_name, last_name, age, gender, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING id, email, first_name, last_name, age, gender, updated_at`,
      values
    );

    return result.rows[0];
  }
}

module.exports = User;

