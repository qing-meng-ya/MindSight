const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../../data/judicial_assistant.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'forensic',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS diagnoses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    patient_name TEXT,
    patient_id TEXT,
    image_path TEXT NOT NULL,
    prediction_result TEXT NOT NULL,
    confidence REAL,
    diagnosis_type TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diagnosis_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    report_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

const initDefaultUsers = async () => {
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)').run('admin', adminPassword, '系统管理员', 'admin');
    console.log('✅ 管理员账号已创建: admin / admin123');
  }
  
  const forensicExists = db.prepare('SELECT id FROM users WHERE username = ?').get('forensic');
  if (!forensicExists) {
    const forensicPassword = await bcrypt.hash('forensic123', 10);
    db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)').run('forensic', forensicPassword, '试验法医', 'forensic');
    console.log('✅ 法医账号已创建: forensic / forensic123');
  }
};

initDefaultUsers();

const getDb = () => db;

const createUser = (username, password, name, role = 'forensic') => {
  const stmt = db.prepare('INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)');
  return stmt.run(username, password, name, role);
};

const getUserByUsername = (username) => {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
};

const getAllUsers = () => {
  return db.prepare('SELECT id, username, name, role, created_at FROM users').all();
};

const createDiagnosis = (data) => {
  const stmt = db.prepare(`
    INSERT INTO diagnoses (user_id, patient_name, patient_id, image_path, prediction_result, confidence, diagnosis_type, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  return stmt.run(
    data.user_id,
    data.patient_name || null,
    data.patient_id || null,
    data.image_path,
    JSON.stringify(data.prediction_result),
    data.confidence,
    data.diagnosis_type || null,
    data.notes || null
  );
};

const getDiagnoses = (userId, role) => {
  if (role === 'admin') {
    return db.prepare(`
      SELECT d.*, u.name as doctor_name 
      FROM diagnoses d 
      JOIN users u ON d.user_id = u.id 
      ORDER BY d.created_at DESC
    `).all();
  }
  return db.prepare(`
    SELECT * FROM diagnoses WHERE user_id = ? ORDER BY created_at DESC
  `).all(userId);
};

const getDiagnosisById = (id) => {
  return db.prepare('SELECT * FROM diagnoses WHERE id = ?').get(id);
};

const createReport = (diagnosisId, userId, reportType, filePath) => {
  const stmt = db.prepare('INSERT INTO reports (diagnosis_id, user_id, report_type, file_path) VALUES (?, ?, ?, ?)');
  return stmt.run(diagnosisId, userId, reportType, filePath);
};

module.exports = {
  getDb,
  createUser,
  getUserByUsername,
  getAllUsers,
  createDiagnosis,
  getDiagnoses,
  getDiagnosisById,
  createReport
};
