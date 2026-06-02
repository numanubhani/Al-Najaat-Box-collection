/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Types mirror we defined in frontend
import {
  DonationBox,
  Collector,
  CollectionRecord,
  IssueReport,
  BoxDemand,
  NotificationItem,
  ExpenseRecord,
  UserRegistration,
  INITIAL_COLLECTORS,
  INITIAL_BOXES,
  INITIAL_COLLECTIONS,
  INITIAL_ISSUES,
  INITIAL_DEMANDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EXPENSES
} from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Set up a structured file-based database for persistence so local tests are 100% functional
const DB_FILE = path.join(process.cwd(), 'database.json');

interface SchemaDB {
  collectors: Collector[];
  donationBoxes: DonationBox[];
  collections: CollectionRecord[];
  issueReports: IssueReport[];
  boxDemands: BoxDemand[];
  notifications: NotificationItem[];
  expenses: ExpenseRecord[];
  registrations: UserRegistration[];
}

// Read database or initialize with seeds
const loadDB = (): SchemaDB => {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    } catch (e) {
      console.error('Error parsing databases, resetting to defaults', e);
    }
  }

  // Initial seed structures
  const defaultDB: SchemaDB = {
    collectors: INITIAL_COLLECTORS,
    donationBoxes: INITIAL_BOXES,
    collections: INITIAL_COLLECTIONS,
    issueReports: INITIAL_ISSUES,
    boxDemands: INITIAL_DEMANDS,
    notifications: INITIAL_NOTIFICATIONS,
    expenses: INITIAL_EXPENSES,
    registrations: [
      {
        id: 'REG-101',
        name: 'Sajid Khan',
        email: 'sajid@gmail.com',
        phone: '+92 (315) 987-6543',
        role: 'Collector',
        status: 'Pending',
        date: '2026-06-01'
      },
      {
        id: 'REG-102',
        name: 'Arsalan Shah',
        email: 'arsalan@gmail.com',
        phone: '+92 (333) 222-1111',
        role: 'Collector',
        status: 'Pending',
        date: '2026-06-01'
      }
    ]
  };
  saveDB(defaultDB);
  return defaultDB;
};

const saveDB = (db: SchemaDB) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
};

// Helper to append server-generated notification
const triggerNotification = (db: SchemaDB, type: 'collection' | 'issue' | 'demand', title: string, description: string) => {
  const newNotif: NotificationItem = {
    id: `NOT-${Date.now()}`,
    type,
    title,
    description,
    time: 'Just now',
    read: false,
  };
  db.notifications.unshift(newNotif);
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Authentication endpoints
app.post('/api/auth/login/', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both credentials' });
  }

  const normalized = email.toLowerCase();
  
  // High fidelity default credential sets
  if (normalized === 'admin@gmail.com') {
    return res.json({
      token: 'jwt-mock-admin-token-938392094',
      user: {
        email: 'Admin@gmail.com',
        name: 'Al-Najaat Admin Office',
        role: 'Admin'
      }
    });
  }

  // Pre-seed matching Naib or generic collectors
  const db = loadDB();
  const matchedCollector = db.collectors.find(c => c.email.toLowerCase() === normalized);

  if (matchedCollector) {
    if (matchedCollector.status === 'Disabled') {
      return res.status(403).json({ error: 'Your collector login session has been disabled by management.' });
    }
    return res.json({
      token: `jwt-mock-collector-${matchedCollector.id}`,
      user: {
        email: matchedCollector.email,
        name: matchedCollector.name,
        role: 'Collector',
        collectorId: matchedCollector.id
      }
    });
  }

  // Custom prefill helpers fallback
  if (normalized === 'naib@gmail.com') {
    return res.json({
      token: 'jwt-mock-collector-col-002',
      user: {
        email: 'naib@gmail.com',
        name: 'Naib Khan',
        role: 'Collector',
        collectorId: 'COL-002'
      }
    });
  }

  // Enable dynamically created register users/collectors
  return res.json({
    token: `jwt-mock-custom-${Date.now()}`,
    user: {
      email: email,
      name: email.split('@')[0],
      role: normalized.includes('admin') ? 'Admin' : 'Collector',
      collectorId: 'COL-001'
    }
  });
});

app.post('/api/auth/register/', (req, res) => {
  const { name, email, phone, role } = req.body;
  const db = loadDB();

  const newReg: UserRegistration = {
    id: `REG-${100 + db.registrations.length + 1}`,
    name,
    email,
    phone,
    role: role || 'Collector',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  };

  db.registrations.unshift(newReg);
  triggerNotification(db, 'demand', 'New Account Registration', `${name} filed an account application for ${newReg.role}. Action needed.`);
  saveDB(db);

  res.status(201).json(newReg);
});

app.get('/api/auth/registrations/', (req, res) => {
  const db = loadDB();
  res.json(db.registrations);
});

app.post('/api/auth/registrations/:id/approve/', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const reg = db.registrations.find(r => r.id === id);

  if (reg) {
    reg.status = 'Approved';
    if (reg.role === 'Collector') {
      const colId = `COL-00${db.collectors.length + 1}`;
      db.collectors.push({
        id: colId,
        name: reg.name,
        phone: reg.phone,
        email: reg.email,
        status: 'Active'
      });
    }
    triggerNotification(db, 'demand', 'Registration Approved', `Account application of "${reg.name}" was approved.`);
    saveDB(db);
    return res.json({ status: 'ok' });
  }

  res.status(404).json({ error: 'Registration application node not found' });
});

app.post('/api/auth/registrations/:id/reject/', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const reg = db.registrations.find(r => r.id === id);

  if (reg) {
    reg.status = 'Rejected';
    triggerNotification(db, 'demand', 'Registration Rejected', `Application of "${reg.name}" was rejected.`);
    saveDB(db);
    return res.json({ status: 'ok' });
  }

  res.status(404).json({ error: 'Registration file not found' });
});

// Donation Boxes Endpoints
app.get('/api/boxes/', (req, res) => {
  const db = loadDB();
  res.json(db.donationBoxes);
});

app.post('/api/boxes/', (req, res) => {
  const db = loadDB();
  const boxData = req.body;
  
  const padded = db.donationBoxes.length + 1 < 10 ? '000' : db.donationBoxes.length + 1 < 100 ? '00' : '0';
  const newId = `BOX-${padded}${db.donationBoxes.length + 1}`;

  const newBox: DonationBox = {
    id: newId,
    collectorId: boxData.collectorId || 'COL-001',
    installationDate: boxData.installationDate || new Date().toISOString().split('T')[0],
    status: boxData.status || 'Active',
    donorName: boxData.donorName,
    address: boxData.address,
    city: boxData.city,
    contactNumber: boxData.contactNumber,
    notes: boxData.notes || '',
    mapLink: boxData.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(boxData.donorName + ' ' + boxData.address + ' ' + boxData.city)}`
  };

  db.donationBoxes.unshift(newBox);
  triggerNotification(db, 'demand', 'New Donation Box Mounted', `${newBox.donorName} ledger registry completed in ${newBox.city}.`);
  saveDB(db);

  res.status(201).json(newBox);
});

app.put('/api/boxes/:id/', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const index = db.donationBoxes.findIndex(b => b.id === id);

  if (index !== -1) {
    db.donationBoxes[index] = { ...req.body, id }; // lock ID safety
    saveDB(db);
    return res.json(db.donationBoxes[index]);
  }

  res.status(404).json({ error: 'Donation box entry record missing' });
});

app.patch('/api/boxes/:id/change_status/', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDB();
  const box = db.donationBoxes.find(b => b.id === id);

  if (box) {
    box.status = status;
    if (status === 'Damaged' || status === 'Missing') {
      triggerNotification(db, 'issue', f`Status Issue: ${status}`, `${box.donorName} in ${box.city} flagged as ${status.toLowerCase()}!`);
    }
    saveDB(db);
    return res.json(box);
  }

  res.status(404).json({ error: 'Box target not listed' });
});

app.delete('/api/boxes/:id/', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const beforeCount = db.donationBoxes.length;
  db.donationBoxes = db.donationBoxes.filter(b => b.id !== id);

  if (db.donationBoxes.length < beforeCount) {
    saveDB(db);
    return res.json({ success: true });
  }

  res.status(404).json({ error: 'Box id not found' });
});

// Collectors CRUD
app.get('/api/collectors/', (req, res) => {
  const db = loadDB();
  res.json(db.collectors);
});

app.patch('/api/collectors/:id/', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDB();
  const col = db.collectors.find(c => c.id === id);

  if (col) {
    col.status = status;
    saveDB(db);
    return res.json(col);
  }

  res.status(404).json({ error: 'Collector node error' });
});

// Collections CRUD
app.get('/api/collections/', (req, res) => {
  const db = loadDB();
  res.json(db.collections);
});

app.post('/api/collections/', (req, res) => {
  const db = loadDB();
  const recData = req.body;

  const newId = `COLLECT-${100 + db.collections.length + 1}`;
  const newRecord: CollectionRecord = {
    id: newId,
    date: new Date().toISOString().split('T')[0],
    donorName: recData.donorName,
    address: recData.address,
    boxId: recData.boxId,
    collectorName: recData.collectorName || 'Naib Khan',
    collectorId: recData.collectorId || 'COL-002',
    amount: Number(recData.amount) || 0,
    notes: recData.notes || ''
  };

  db.collections.unshift(newRecord);
  triggerNotification(
    db,
    'collection',
    'Collection Settlement Logged',
    `${newRecord.collectorName} registered $${newRecord.amount.toFixed(2)} from ${newRecord.donorName}.`
  );
  saveDB(db);

  res.status(201).json(newRecord);
});

// Issue Incident reports
app.get('/api/issues/', (req, res) => {
  const db = loadDB();
  res.json(db.issueReports);
});

app.post('/api/issues/', (req, res) => {
  const db = loadDB();
  const issueData = req.body;

  const newId = `ISS-${100 + db.issueReports.length + 1}`;
  const newIssue: IssueReport = {
    id: newId,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    collectorName: issueData.collectorName || 'Naib Khan',
    boxId: issueData.boxId,
    issueType: issueData.issueType || 'Lock sticky',
    description: issueData.description || '',
    photoUrl: issueData.photoUrl || ''
  };

  // Auto patch target box status
  const matchedBox = db.donationBoxes.find(b => b.id === newIssue.boxId);
  if (matchedBox) {
    if (newIssue.issueType === 'Damaged Box') {
      matchedBox.status = 'Damaged';
    } else if (newIssue.issueType === 'Missing Box') {
      matchedBox.status = 'Missing';
    }
  }

  db.issueReports.unshift(newIssue);
  triggerNotification(
    db,
    'issue',
    'New Defect Issue Filed',
    `Box ${newIssue.boxId} reported with "${newIssue.issueType}" by ${newIssue.collectorName}.`
  );
  saveDB(db);

  res.status(201).json(newIssue);
});

app.patch('/api/issues/:id/', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDB();
  const issue = db.issueReports.find(i => i.id === id);

  if (issue) {
    issue.status = status;
    if (status === 'Resolved') {
      // restore box to Active
      const matchedBox = db.donationBoxes.find(b => b.id === issue.boxId);
      if (matchedBox) {
        matchedBox.status = 'Active';
      }
    }
    saveDB(db);
    return res.json(issue);
  }

  res.status(404).json({ error: 'Issue log item index out of scope' });
});

// Placement proposals (Demands)
app.get('/api/demands/', (req, res) => {
  const db = loadDB();
  res.json(db.boxDemands);
});

app.post('/api/demands/', (req, res) => {
  const db = loadDB();
  const demData = req.body;

  const newId = `DEM-${100 + db.boxDemands.length + 1}`;
  const newDemand: BoxDemand = {
    id: newId,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    collectorName: demData.collectorName || 'Naib Khan',
    suggestedLocation: demData.suggestedLocation,
    address: demData.address,
    city: demData.city,
    contactPerson: demData.contactPerson,
    contactNumber: demData.contactNumber,
    estimatedTraffic: demData.estimatedTraffic,
    notes: demData.notes || ''
  };

  db.boxDemands.unshift(newDemand);
  triggerNotification(
    db,
    'demand',
    'Placement Request Logged',
    `Demand for new box placement at "${newDemand.suggestedLocation}" uploaded.`
  );
  saveDB(db);

  res.status(201).json(newDemand);
});

app.patch('/api/demands/:id/', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDB();
  const demand = db.boxDemands.find(d => d.id === id);

  if (demand) {
    demand.status = status;
    // Auto-create box if set Approved
    if (status === 'Approved') {
      const padded = db.donationBoxes.length + 1 < 10 ? '000' : db.donationBoxes.length + 1 < 100 ? '00' : '0';
      const newBoxId = `BOX-${padded}${db.donationBoxes.length + 1}`;

      const newBox: DonationBox = {
        id: newBoxId,
        donorName: demand.suggestedLocation,
        address: demand.address,
        city: demand.city,
        contactNumber: demand.contactNumber,
        collectorId: 'COL-001',
        installationDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        notes: `Automatic build from demand placement approval. Estimated footfall traffic: ${demand.estimatedTraffic}. notes: ${demand.notes || ''}`,
        mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(demand.suggestedLocation + ' ' + demand.address + ' ' + demand.city)}`
      };
      db.donationBoxes.unshift(newBox);
      triggerNotification(db, 'demand', 'Approved Placement Mounted', `Auto-mounted Approved Box ID: ${newBoxId} at ${demand.suggestedLocation}.`);
    }
    saveDB(db);
    return res.json(demand);
  }

  res.status(404).json({ error: 'Placement proposal request failed' });
});

// Fuel and general expenses
app.get('/api/expenses/', (req, res) => {
  const db = loadDB();
  res.json(db.expenses);
});

app.post('/api/expenses/', (req, res) => {
  const db = loadDB();
  const expData = req.body;

  const newId = `EXP-${100 + db.expenses.length + 1}`;
  const newExp: ExpenseRecord = {
    id: newId,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    collectorId: expData.collectorId || 'COL-001',
    collectorName: expData.collectorName || 'Naib Khan',
    category: expData.category || 'Petrol',
    amount: Number(expData.amount) || 0,
    description: expData.description || ''
  };

  db.expenses.unshift(newExp);
  triggerNotification(
    db,
    'issue',
    'Claim Submitted',
    `${newExp.collectorName} uploaded fuel claim for $${newExp.amount.toFixed(2)}.`
  );
  saveDB(db);

  res.status(201).json(newExp);
});

app.patch('/api/expenses/:id/', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = loadDB();
  const exp = db.expenses.find(e => e.id === id);

  if (exp) {
    exp.status = status;
    saveDB(db);
    return res.json(exp);
  }

  res.status(404).json({ error: 'Expense node claim identifier error' });
});

// Notifications Alert center
app.get('/api/notifications/', (req, res) => {
  const db = loadDB();
  res.json(db.notifications);
});

app.post('/api/notifications/:id/mark_read/', (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const notif = db.notifications.find(n => n.id === id);

  if (notif) {
    notif.read = true;
    saveDB(db);
    return res.json({ success: true });
  }

  res.status(404).json({ error: 'Notification key failed' });
});

app.post('/api/notifications/mark_all_read/', (req, res) => {
  const db = loadDB();
  db.notifications.forEach(n => { n.read = true; });
  saveDB(db);
  res.json({ success: true });
});

// ----------------------------------------------------
// WEB SERVER SETUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al-Najaat dynamic ledger server running on http://localhost:${PORT}`);
  });
}

// Global logger helper replacement
function f(strings: TemplateStringsArray, ...values: any[]) {
  return strings.reduce((r, s, i) => r + s + (values[i] || ''), '');
}

startServer();
