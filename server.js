/**
 * Shree Bheemashankar S S K N., Maragur - Sugar Allotment System
 * Standalone Node.js / Express REST API Backend (server.js)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const db = {
  users: [
    { id: 'U001', password: 'admin123', name: 'Administrator', role: 'Admin', status: 'ACTIVE' },
    { id: 'U002', password: '123456', name: 'Cashier 1', role: 'Cashier', status: 'ACTIVE' }
  ],
  shareholders: {
    'SH12345': { id: 'SH12345', name: 'Ramesh Patil', address: 'Maragur Village', phone: '9876543210', memberType: 'Regular Shareholder', shares: 4, status: 'ACTIVE' },
    'SH12346': { id: 'SH12346', name: 'Suresh Kulkarni', address: 'Maragur Main Road', phone: '9876543211', memberType: 'Regular Shareholder', shares: 10, status: 'ACTIVE' },
    'SH12347': { id: 'SH12347', name: 'Anita Deshmukh', address: 'Maragur East', phone: '9876543212', memberType: 'Regular Shareholder', shares: 2, status: 'ACTIVE' },
    'SH12348': { id: 'SH12348', name: 'Basavaraj Maragur', address: 'Station Road', phone: '9876543213', memberType: 'Regular Shareholder', shares: 8, status: 'ACTIVE' }
  },
  allotments: [
    { receiptNumber: 'SLIP-9001', id: 'SH12347', name: 'Anita Deshmukh', shares: 2, quantity: 50, rate: 20, totalAmount: 1000, amountPaid: 1000, balance: 0, cashier: 'Cashier 1', date: '2026-08-28', time: '14:30:00' }
  ],
  sessions: {},
  pairingSessions: {}
};

app.post('/api/login', (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) {
    return res.status(400).json({ success: false, message: 'User ID and password required.' });
  }

  const user = db.users.find(u => u.id.toUpperCase() === userId.trim().toUpperCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid User ID or Password.' });
  }

  const token = 'SAT-' + crypto.randomUUID();
  db.sessions[token] = { id: user.id, name: user.name, role: user.role, createdAt: Date.now() };

  res.json({ success: true, token: token, id: user.id, name: user.name, role: user.role });
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '') : req.query.token;

  if (!token || !db.sessions[token]) {
    return res.status(401).json({ sessionExpired: true, message: 'Session expired or invalid.' });
  }
  req.user = db.sessions[token];
  next();
}

app.get('/api/me', authMiddleware, (req, res) => {
  res.json({ loggedIn: true, ...req.user });
});

app.post('/api/logout', authMiddleware, (req, res) => {
  const token = req.headers.authorization ? req.headers.authorization.replace('Bearer ', '') : req.query.token;
  delete db.sessions[token];
  res.json({ success: true });
});

// POST /api/shareholders - Add New Shareholder
app.post('/api/shareholders', authMiddleware, (req, res) => {
  const { id, name, address, phone, memberType, shares } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, message: 'Shareholder ID and Name are required.' });
  }

  const shId = id.trim().toUpperCase();
  if (db.shareholders[shId]) {
    return res.status(400).json({ success: false, message: `Shareholder ID (${shId}) already exists!` });
  }

  db.shareholders[shId] = {
    id: shId,
    name: name.trim(),
    address: address ? address.trim() : 'Maragur',
    phone: phone ? phone.trim() : '',
    memberType: memberType || 'Regular Shareholder',
    shares: parseInt(shares, 10) || 1,
    status: 'ACTIVE'
  };

  res.json({ success: true, message: `Shareholder (${shId} - ${name}) added successfully!` });
});

app.get('/api/shareholders/:id', authMiddleware, (req, res) => {
  const id = req.params.id.trim().toUpperCase();
  const sh = db.shareholders[id];
  if (!sh) return res.json({ found: false, message: 'Shareholder ID not found.' });

  const hasReceived = db.allotments.some(a => a.id.toUpperCase() === id);

  res.json({
    found: true,
    name: sh.name,
    address: sh.address,
    phone: sh.phone,
    mobile: sh.phone,
    memberType: sh.memberType,
    shareQuantity: sh.shares,
    eligible: sh.status === 'ACTIVE' && sh.shares >= 1,
    hasReceived: hasReceived
  });
});

app.post('/api/allotments', authMiddleware, (req, res) => {
  const { shareholder, aadhaarNumber, mobileNumber, amountPaid, allotmentOption, quantity, totalAmount } = req.body;
  const shId = shareholder.id.trim().toUpperCase();

  const existing = db.allotments.find(a => a.id.toUpperCase() === shId);
  if (existing) {
    return res.status(400).json({ success: false, message: 'This shareholder has already received an allotment.' });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0];
  const receiptNumber = 'SLIP-' + Math.floor(100000 + Math.random() * 900000);

  const qtyKg = parseFloat(quantity) || 0;
  const totalAmt = parseFloat(totalAmount) || (qtyKg * 20);
  const amtPaid = parseFloat(amountPaid) || 0;
  const balance = totalAmt - amtPaid;

  const record = {
    receiptNumber,
    id: shId,
    name: shareholder.name,
    shares: shareholder.shareQuantity,
    quantity: qtyKg,
    totalAmount: totalAmt,
    amountPaid: amtPaid,
    balance,
    aadhaarNumber,
    mobileNumber,
    cashier: req.user.name,
    date: dateStr,
    time: timeStr
  };

  db.allotments.unshift(record);

  res.json({
    success: true,
    message: 'Sugar Allotment Recorded Successfully!',
    receiptNumber,
    shareholderId: shId,
    quantity: qtyKg,
    totalAmount: totalAmt,
    amountPaid: amtPaid,
    balance,
    receivedBy: shareholder.name,
    date: `${dateStr} ${timeStr}`
  });
});

app.get('/api/recent-transactions', authMiddleware, (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  res.json(db.allotments.slice(0, limit));
});

app.post('/api/pairing/register', (req, res) => {
  const { sessionCode, option } = req.body;
  db.pairingSessions[sessionCode] = { phoneCount: 1, option: option || 2, scannedData: null, createdAt: Date.now() };
  res.json({ success: true });
});

app.get('/api/pairing/:code/count', (req, res) => {
  const sess = db.pairingSessions[req.params.code];
  res.json(sess ? sess.phoneCount : 0);
});

app.post('/api/pairing/:code/scan', (req, res) => {
  const { shareNo } = req.body;
  const sess = db.pairingSessions[req.params.code];
  if (!sess) return res.status(404).json({ success: false, message: 'Pairing session not found.' });

  sess.scannedData = { shareNo, timestamp: Date.now() };
  res.json({ success: true });
});

app.get('/api/pairing/:code/poll', (req, res) => {
  const sess = db.pairingSessions[req.params.code];
  if (!sess || !sess.scannedData) return res.json(null);

  const scan = sess.scannedData;
  sess.scannedData = null;
  res.json(scan);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
