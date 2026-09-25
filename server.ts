import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Hostinger MySQL Connection Pool
let dbPool: mysql.Pool | null = null;
let dbStatus = {
  configured: false,
  connected: false,
  host: process.env.MYSQL_HOST || '',
  database: process.env.MYSQL_DATABASE || '',
  user: process.env.MYSQL_USER || '',
  port: Number(process.env.MYSQL_PORT) || 3306,
  error: '',
  lastChecked: '',
};

function initDbPool() {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = Number(process.env.MYSQL_PORT) || 3306;

  if (host && user && database) {
    dbStatus.configured = true;
    dbStatus.host = host;
    dbStatus.user = user;
    dbStatus.database = database;
    dbStatus.port = port;

    try {
      dbPool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 8000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });

      // Test connection and auto-create tables
      checkAndInitTables();
    } catch (err: any) {
      dbStatus.connected = false;
      dbStatus.error = err.message || 'Failed to initialize MySQL pool';
      console.error('MySQL Pool Init Error:', err);
    }
  } else {
    dbStatus.configured = false;
    dbStatus.connected = false;
    dbStatus.error = 'MySQL credentials not provided in environment variables';
  }
}

async function checkAndInitTables() {
  if (!dbPool) return;
  try {
    const conn = await dbPool.getConnection();
    dbStatus.connected = true;
    dbStatus.error = '';
    dbStatus.lastChecked = new Date().toISOString();
    console.log(`[MySQL] Connected successfully to ${dbStatus.host} / database: ${dbStatus.database}`);

    // Create employees table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(64) PRIMARY KEY,
        emp_code VARCHAR(32),
        name VARCHAR(128) NOT NULL,
        surname VARCHAR(128),
        father_name VARCHAR(128),
        gender VARCHAR(32),
        dob VARCHAR(32),
        nationality VARCHAR(64),
        education VARCHAR(64),
        doj VARCHAR(32),
        designation VARCHAR(64),
        category VARCHAR(32),
        department VARCHAR(64),
        location VARCHAR(128),
        mobile VARCHAR(32),
        email VARCHAR(128),
        pan VARCHAR(32),
        aadhar VARCHAR(32),
        uan VARCHAR(32),
        pf_number VARCHAR(64),
        esic_number VARCHAR(64),
        lwf_number VARCHAR(64),
        bank_name VARCHAR(128),
        bank_account VARCHAR(64),
        ifsc_code VARCHAR(32),
        present_address TEXT,
        permanent_address TEXT,
        service_book_no VARCHAR(64),
        exit_date VARCHAR(32),
        exit_reason TEXT,
        mark_identification TEXT,
        photo LONGTEXT,
        signature LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create form_c_records table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS form_c_records (
        id VARCHAR(64) PRIMARY KEY,
        sl_no INT,
        emp_code VARCHAR(32),
        name VARCHAR(128),
        father_name VARCHAR(128),
        designation VARCHAR(64),
        wage_period VARCHAR(64),
        minimum_wage DECIMAL(10,2) DEFAULT 0.00,
        actual_wage DECIMAL(10,2) DEFAULT 0.00,
        total_fine DECIMAL(10,2) DEFAULT 0.00,
        damage_loss_cause TEXT,
        damage_loss_amount DECIMAL(10,2) DEFAULT 0.00,
        deduction_amount DECIMAL(10,2) DEFAULT 0.00,
        show_cause_date VARCHAR(32),
        explanation_heard VARCHAR(16),
        wages_payable DECIMAL(10,2) DEFAULT 0.00,
        realized_date VARCHAR(32),
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create form_d_records table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS form_d_records (
        id VARCHAR(64) PRIMARY KEY,
        sl_no INT,
        emp_code VARCHAR(32),
        name VARCHAR(128),
        father_name VARCHAR(128),
        designation VARCHAR(64),
        nature_of_work VARCHAR(128),
        advance_date VARCHAR(32),
        advance_amount DECIMAL(10,2) DEFAULT 0.00,
        advance_purpose TEXT,
        installments INT DEFAULT 1,
        postponements TEXT,
        repaid_date VARCHAR(32),
        repaid_amount DECIMAL(10,2) DEFAULT 0.00,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Create user_accounts table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS user_accounts (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) UNIQUE NOT NULL,
        password VARCHAR(128) NOT NULL,
        name VARCHAR(128) NOT NULL,
        role VARCHAR(32) NOT NULL,
        email VARCHAR(128),
        mobile VARCHAR(32),
        created_at VARCHAR(32)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    conn.release();
  } catch (err: any) {
    dbStatus.connected = false;
    dbStatus.error = err.message || 'Failed connecting to Hostinger MySQL';
    dbStatus.lastChecked = new Date().toISOString();
    console.error('[MySQL Connection Warning]', err.message);
  }
}

initDbPool();

// API Endpoints

// 1. Database connection status
app.get('/api/db-status', async (req, res) => {
  if (dbPool && (!dbStatus.connected || !dbStatus.lastChecked)) {
    await checkAndInitTables();
  }
  res.json({
    ...dbStatus,
    targetPlatform: 'Hostinger MySQL (gloziyofire.com / gloziyoemp.com)',
    helpGuide: {
      step1: 'Log in to Hostinger hPanel at https://hpanel.hostinger.com',
      step2: 'Navigate to Websites > gloziyofire.com (or gloziyoemp.com) > Databases > MySQL Databases',
      step3: 'Go to "Remote MySQL" and authorize remote connections by entering "%" (Any Host) or your app IP',
      step4: 'Set MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, and MYSQL_PASSWORD environment variables',
    }
  });
});

// 2. Test / Re-connect DB
app.post('/api/db-reconnect', async (req, res) => {
  initDbPool();
  await checkAndInitTables();
  res.json(dbStatus);
});

// 3. Employees CRUD
app.get('/api/employees', async (req, res) => {
  if (!dbPool || !dbStatus.connected) {
    return res.status(503).json({ error: 'Database not connected. Using local storage mode.', fallback: true });
  }
  try {
    const [rows]: any = await dbPool.query('SELECT * FROM employees ORDER BY created_at DESC');
    const employees = rows.map((r: any) => ({
      id: r.id,
      empCode: r.emp_code,
      name: r.name,
      surname: r.surname || '',
      fatherName: r.father_name || '',
      gender: r.gender || 'Male',
      dob: r.dob || '',
      nationality: r.nationality || 'Indian',
      education: r.education || '',
      doj: r.doj || '',
      designation: r.designation || '',
      category: r.category || 'skilled',
      department: r.department || '',
      location: r.location || '',
      mobile: r.mobile || '',
      email: r.email || '',
      pan: r.pan || '',
      aadhar: r.aadhar || '',
      uan: r.uan || '',
      pfNumber: r.pf_number || '',
      esicNumber: r.esic_number || '',
      lwfNumber: r.lwf_number || '',
      bankName: r.bank_name || '',
      bankAccount: r.bank_account || '',
      ifscCode: r.ifsc_code || '',
      presentAddress: r.present_address || '',
      permanentAddress: r.permanent_address || '',
      serviceBookNo: r.service_book_no || '',
      exitDate: r.exit_date || undefined,
      exitReason: r.exit_reason || undefined,
      markIdentification: r.mark_identification || '',
      photo: r.photo || undefined,
      signature: r.signature || undefined,
    }));
    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save / Upsert single employee
app.post('/api/employees', async (req, res) => {
  if (!dbPool || !dbStatus.connected) {
    return res.status(503).json({ error: 'Database not connected', fallback: true });
  }
  const e = req.body;
  if (!e.id || !e.name) {
    return res.status(400).json({ error: 'Employee ID and name are required' });
  }

  try {
    const query = `
      INSERT INTO employees (
        id, emp_code, name, surname, father_name, gender, dob, nationality, education, doj,
        designation, category, department, location, mobile, email, pan, aadhar, uan, pf_number,
        esic_number, lwf_number, bank_name, bank_account, ifsc_code, present_address, permanent_address,
        service_book_no, exit_date, exit_reason, mark_identification, photo, signature
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        emp_code = VALUES(emp_code),
        name = VALUES(name),
        surname = VALUES(surname),
        father_name = VALUES(father_name),
        gender = VALUES(gender),
        dob = VALUES(dob),
        nationality = VALUES(nationality),
        education = VALUES(education),
        doj = VALUES(doj),
        designation = VALUES(designation),
        category = VALUES(category),
        department = VALUES(department),
        location = VALUES(location),
        mobile = VALUES(mobile),
        email = VALUES(email),
        pan = VALUES(pan),
        aadhar = VALUES(aadhar),
        uan = VALUES(uan),
        pf_number = VALUES(pf_number),
        esic_number = VALUES(esic_number),
        lwf_number = VALUES(lwf_number),
        bank_name = VALUES(bank_name),
        bank_account = VALUES(bank_account),
        ifsc_code = VALUES(ifsc_code),
        present_address = VALUES(present_address),
        permanent_address = VALUES(permanent_address),
        service_book_no = VALUES(service_book_no),
        exit_date = VALUES(exit_date),
        exit_reason = VALUES(exit_reason),
        mark_identification = VALUES(mark_identification),
        photo = VALUES(photo),
        signature = VALUES(signature)
    `;

    await dbPool.query(query, [
      e.id,
      e.empCode || '',
      e.name,
      e.surname || '',
      e.fatherName || '',
      e.gender || 'Male',
      e.dob || '',
      e.nationality || 'Indian',
      e.education || '',
      e.doj || '',
      e.designation || '',
      e.category || 'skilled',
      e.department || '',
      e.location || '',
      e.mobile || '',
      e.email || '',
      e.pan || '',
      e.aadhar || '',
      e.uan || '',
      e.pfNumber || '',
      e.esicNumber || '',
      e.lwfNumber || '',
      e.bankName || '',
      e.bankAccount || '',
      e.ifscCode || '',
      e.presentAddress || '',
      e.permanentAddress || '',
      e.serviceBookNo || '',
      e.exitDate || null,
      e.exitReason || null,
      e.markIdentification || '',
      e.photo || null,
      e.signature || null,
    ]);

    res.json({ success: true, employee: e });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete employee
app.delete('/api/employees/:id', async (req, res) => {
  if (!dbPool || !dbStatus.connected) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  try {
    await dbPool.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk sync from local storage
app.post('/api/employees/bulk-sync', async (req, res) => {
  if (!dbPool || !dbStatus.connected) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  const { employees } = req.body;
  if (!Array.isArray(employees)) {
    return res.status(400).json({ error: 'Employees array required' });
  }

  let count = 0;
  for (const e of employees) {
    try {
      await dbPool.query(`
        INSERT INTO employees (
          id, emp_code, name, surname, father_name, gender, dob, nationality, education, doj,
          designation, category, department, location, mobile, email, pan, aadhar, uan, pf_number,
          esic_number, lwf_number, bank_name, bank_account, ifsc_code, present_address, permanent_address,
          service_book_no, exit_date, exit_reason, mark_identification, photo, signature
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name = VALUES(name)
      `, [
        e.id, e.empCode || '', e.name, e.surname || '', e.fatherName || '', e.gender || 'Male',
        e.dob || '', e.nationality || 'Indian', e.education || '', e.doj || '', e.designation || '',
        e.category || 'skilled', e.department || '', e.location || '', e.mobile || '', e.email || '',
        e.pan || '', e.aadhar || '', e.uan || '', e.pfNumber || '', e.esicNumber || '', e.lwfNumber || '',
        e.bankName || '', e.bankAccount || '', e.ifscCode || '', e.presentAddress || '', e.permanentAddress || '',
        e.serviceBookNo || '', e.exitDate || null, e.exitReason || null, e.markIdentification || '',
        e.photo || null, e.signature || null
      ]);
      count++;
    } catch (err) {
      console.error('Failed to sync employee:', e.name, err);
    }
  }

  res.json({ success: true, synced: count });
});

// Vite / Static setup
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
