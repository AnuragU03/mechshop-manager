const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'Anurag@1095',
  database: process.env.DB_NAME || 'mechshop',
};

// --- Auth Middleware ---
function auth(requiredRole = null) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });
    const token = authHeader.split(' ')[1];
    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// --- Audit Log Helper ---
async function logAction(user_id, action, details) {
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)', [user_id, action, details]);
  await conn.end();
}

// --- Safe helper for all DB writes ---
function safe(val) {
  return val === undefined ? null : val;
}

// --- Auth Endpoints ---
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  const [users] = await conn.execute('SELECT * FROM users WHERE username=?', [username]);
  await conn.end();
  if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
  const user = users[0];
  if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// --- Dashboard/Reports Endpoints ---
app.get('/api/dashboard', auth(), async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [[{ total_sales }]] = await conn.execute('SELECT IFNULL(SUM(total),0) AS total_sales FROM sales');
  const [[{ inventory_count }]] = await conn.execute('SELECT COUNT(*) AS inventory_count FROM inventory');
  const [[{ today_orders }]] = await conn.execute("SELECT COUNT(*) AS today_orders FROM sales WHERE date = CURDATE()");
  const [[{ active_customers }]] = await conn.execute('SELECT COUNT(DISTINCT customer) AS active_customers FROM sales WHERE date >= CURDATE() - INTERVAL 7 DAY');
  const [recent_sales] = await conn.execute('SELECT * FROM sales ORDER BY id DESC LIMIT 5');
  await conn.end();
  res.json({ total_sales, inventory_count, today_orders, active_customers, recent_sales });
});

app.get('/api/reports', auth(), async (req, res) => {
  const { start, end, customer, item } = req.query;
  let where = 'WHERE 1=1';
  const params = [];
  if (start) { where += ' AND date >= ?'; params.push(start); }
  if (end) { where += ' AND date <= ?'; params.push(end); }
  if (customer) { where += ' AND customer = ?'; params.push(customer); }
  if (item) { where += ' AND items = ?'; params.push(item); }
  const conn = await mysql.createConnection(dbConfig);
  const [[{ total_sales }]] = await conn.execute(`SELECT IFNULL(SUM(total),0) AS total_sales FROM sales ${where}`, params);
  const [[{ total_purchases }]] = await conn.execute('SELECT IFNULL(SUM(wholesale_amount),0) AS total_purchases FROM purchases');
  const profit = total_sales - total_purchases;
  const [best_selling] = await conn.execute('SELECT items, SUM(quantity) as qty FROM sales GROUP BY items ORDER BY qty DESC LIMIT 1');
  const [low_stock] = await conn.execute('SELECT * FROM inventory WHERE stock < low_stock_threshold');
  await conn.end();
  res.json({ total_sales, total_purchases, profit, best_selling: best_selling[0] || null, low_stock });
});

// --- Inventory Endpoints ---
app.get('/api/inventory', auth(), async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM inventory');
  await conn.end();
  res.json(rows);
});

app.post('/api/inventory', auth('admin'), async (req, res) => {
  const {
    name, category, stock,
    wholesale_price, sales_price,
    low_stock_threshold, batch, expiry_date
  } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute(
    'INSERT INTO inventory (name, category, stock, wholesale_price, sales_price, low_stock_threshold, batch, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      safe(name), safe(category), safe(stock),
      safe(wholesale_price), safe(sales_price),
      safe(low_stock_threshold), safe(batch), safe(expiry_date)
    ]
  );
  await logAction(req.user.id, 'create_inventory', `Created inventory item=${name}`);
  await conn.end();
  res.json({ success: true });
});

app.put('/api/inventory/:id', auth('admin'), async (req, res) => {
  const { id } = req.params;
  const { name, category, stock, wholesale_price, sales_price, low_stock_threshold, batch, expiry_date } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute(
    'UPDATE inventory SET name=?, category=?, stock=?, wholesale_price=?, sales_price=?, low_stock_threshold=?, batch=?, expiry_date=? WHERE id=?',
    [
      safe(name), safe(category), safe(stock),
      safe(wholesale_price), safe(sales_price),
      safe(low_stock_threshold), safe(batch), safe(expiry_date),
      safe(id)
    ]
  );
  await logAction(req.user.id, 'update_inventory', `Updated inventory id=${id}`);
  await conn.end();
  res.json({ success: true });
});

app.delete('/api/inventory/:id', auth('admin'), async (req, res) => {
  const { id } = req.params;
  const conn = await mysql.createConnection(dbConfig);
  await conn.execute('DELETE FROM inventory WHERE id=?', [id]);
  await logAction(req.user.id, 'delete_inventory', `Deleted inventory id=${id}`);
  await conn.end();
  res.json({ success: true });
});

// --- Sales Endpoints ---
app.get('/api/sales', auth(), async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM sales');
  await conn.end();
  res.json(rows);
});

app.post('/api/sales', auth(), async (req, res) => {
  let { membership_no, customer, items, quantity } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  // Get inventory item for rate
  const [inv] = await conn.execute('SELECT * FROM inventory WHERE name=?', [items]);
  if (inv.length === 0) {
    await conn.end();
    return res.status(400).json({ error: 'Item not found in inventory' });
  }
  const rate = inv[0].sales_price ?? 0;
  quantity = quantity ?? 0;
  const total = rate * quantity;
  // Ensure no undefined values
  const safeMembershipNo = safe(membership_no);
  const safeItems = safe(items);
  const safeQuantity = safe(quantity);
  const safeRate = safe(rate);
  const safeTotal = safe(total);
  // Insert sale
  const [result] = await conn.execute(
    'INSERT INTO sales (customer, items, quantity, rate, total, date) VALUES (?, ?, ?, ?, ?, CURDATE())',
    [safeMembershipNo, safeItems, safeQuantity, safeRate, safeTotal]
  );
  // Decrease inventory stock
  await conn.execute('UPDATE inventory SET stock = stock - ? WHERE name=?', [safeQuantity, safeItems]);
  await logAction(req.user.id, 'create_sale', `Created sale id=${result.insertId}`);
  await conn.end();
  res.json({ success: true, bill_no: result.insertId });
});

// --- Purchases Endpoints ---
app.get('/api/purchases', auth(), async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM purchases');
  await conn.end();
  res.json(rows);
});

app.post('/api/purchases', auth(), async (req, res) => {
  const { supplier, items, quantity, date_of_purchase, wholesale_amount, sales_price } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  // Insert purchase
  await conn.execute(
    'INSERT INTO purchases (supplier, items, quantity, date_of_purchase, wholesale_amount, sales_price) VALUES (?, ?, ?, ?, ?, ?)',
    [safe(supplier), safe(items), safe(quantity), safe(date_of_purchase), safe(wholesale_amount), safe(sales_price)]
  );
  // Update inventory: increase stock, update prices
  const [inv] = await conn.execute('SELECT * FROM inventory WHERE name=?', [items]);
  if (inv.length > 0) {
    await conn.execute('UPDATE inventory SET stock = stock + ?, wholesale_price=?, sales_price=? WHERE name=?', [safe(quantity), safe(wholesale_amount), safe(sales_price), safe(items)]);
  } else {
    await conn.execute('INSERT INTO inventory (name, category, stock, wholesale_price, sales_price) VALUES (?, ?, ?, ?, ?)', [safe(items), '', safe(quantity), safe(wholesale_amount), safe(sales_price)]);
  }
  // Note: result.insertId is not used for logAction here, but could be added if needed
  await logAction(req.user.id, 'create_purchase', `Created purchase`);
  await conn.end();
  res.json({ success: true });
});

// --- Customers Endpoints ---
app.get('/api/customers', auth(), async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM customers');
  await conn.end();
  res.json(rows);
});

// Get customer by phone
app.get('/api/customers/phone/:phone', auth(), async (req, res) => {
  const { phone } = req.params;
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM customers WHERE phone = ?', [phone]);
  await conn.end();
  if (rows.length > 0) {
    res.json(rows[0]);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

// Add customer if phone not exists, else return existing
app.post('/api/customers', auth(), async (req, res) => {
  const { name, contact, phone } = req.body;
  const conn = await mysql.createConnection(dbConfig);
  const [rows] = await conn.execute('SELECT * FROM customers WHERE phone = ?', [safe(phone)]);
  if (rows.length > 0) {
    await conn.end();
    return res.json(rows[0]);
  }
  const [result] = await conn.execute(
    'INSERT INTO customers (name, contact, phone) VALUES (?, ?, ?)',
    [safe(name), safe(contact), safe(phone)]
  );
  const [newCustomer] = await conn.execute('SELECT * FROM customers WHERE membership_no = ?', [result.insertId]);
  await logAction(req.user.id, 'create_customer', `Created customer id=${result.insertId}`);
  await conn.end();
  res.json(newCustomer[0]);
});

// --- Customer History ---
app.get('/api/customers/:membership_no/history', auth(), async (req, res) => {
  const { membership_no } = req.params;
  const conn = await mysql.createConnection(dbConfig);
  const [sales] = await conn.execute('SELECT * FROM sales WHERE customer=?', [membership_no]);
  await conn.end();
  res.json(sales);
});

// --- Invoice Endpoint ---
app.get('/api/sales/:id/invoice', auth(), async (req, res) => {
  const { id } = req.params;
  const conn = await mysql.createConnection(dbConfig);
  const [sales] = await conn.execute('SELECT * FROM sales WHERE id=?', [id]);
  if (sales.length === 0) { await conn.end(); return res.status(404).json({ error: 'Not found' }); }
  const sale = sales[0];
  const [customer] = await conn.execute('SELECT * FROM customers WHERE membership_no=?', [sale.customer]);
  await conn.end();
  res.json({ sale, customer: customer[0] });
});

// --- Audit Log Endpoint (admin only) ---
app.get('/api/audit-log', auth('admin'), async (req, res) => {
  const conn = await mysql.createConnection(dbConfig);
  const [logs] = await conn.execute('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100');
  await conn.end();
  res.json(logs);
});

// --- (Optional) SMS/Email Placeholder ---
app.post('/api/notify', auth('admin'), async (req, res) => {
  // Integrate with SMS/email API here
  res.json({ success: true, message: 'Notification sent (simulated)' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 