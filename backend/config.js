require('dotenv').config();

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'church_management',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// MySQL pool
let pool = null;

async function initializeDatabase() {
  try {
    // Connect to MySQL
    pool = mysql.createPool(dbConfig);
    await pool.getConnection();
    console.log('Connected to MySQL database');
    
    // Create MySQL tables if they don't exist
    await pool.execute(`CREATE TABLE IF NOT EXISTS choristers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      division VARCHAR(255) NOT NULL
    )`);
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS instruments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type VARCHAR(255) NOT NULL,
      number VARCHAR(255) NOT NULL UNIQUE,
      is_available BOOLEAN DEFAULT TRUE
    )`);
    
    await pool.execute(`CREATE TABLE IF NOT EXISTS logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      division VARCHAR(255) NOT NULL,
      \`group\` VARCHAR(255),
      chorister_name VARCHAR(255) NOT NULL,
      phone VARCHAR(255),
      instrument_type VARCHAR(255) NOT NULL,
      instrument_number VARCHAR(255) NOT NULL,
      sign_out_time DATETIME NOT NULL,
      sign_in_time DATETIME,
      condition_returned TEXT
    )`);
    
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error.message);
    throw error;
  }
}

// Helper function to execute queries
async function executeQuery(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Helper function to execute single row queries
async function executeQuerySingle(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows[0];
}

// Helper function to execute insert/update/delete
async function executeUpdate(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

// Helper function to begin transaction
async function beginTransaction() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

// Helper function to commit transaction
async function commitTransaction(connection) {
  await connection.commit();
  connection.release();
}

module.exports = {
  initializeDatabase,
  executeQuery,
  executeQuerySingle,
  executeUpdate,
  beginTransaction,
  commitTransaction
}; 