require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 4002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'finance_manager';
let db;

// Connect to MongoDB
MongoClient.connect(mongoUri)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'] }));
app.use(express.json());
app.use(morgan('dev'));

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Placeholder root
app.get('/', (_req, res) => {
  res.json({ message: 'Finance Manager Node server running' });
});

// ============= AUTHENTICATION ENDPOINTS =============

// Signup endpoint
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const user = {
      email,
      name: name || 'User',
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('users').insertOne(user);
    const userId = result.insertedId.toString();
    
    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      user: {
        id: userId,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login endpoint
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    if (!db) {
      return res.status(503).json({ error: 'Database not available' });
    }
    
    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const userId = user._id.toString();
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      user: {
        id: userId,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// ============= EXPENSE ENDPOINTS =============

// Get all expenses for user
app.get('/expenses', verifyToken, (_req, res) => {
  try {
    const userId = _req.userId;
    if (!db) return res.json({ expenses: [] });
    
    db.collection('expenses').find({ userId }).toArray()
      .then(expenses => {
        const mapped = expenses.map(exp => ({ ...exp, id: exp._id.toString() }));
        res.json({ expenses: mapped });
      })
      .catch(error => {
        console.error('Error fetching expenses:', error);
        res.json({ expenses: [] });
      });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.json({ expenses: [] });
  }
});

// Create expense
app.post('/expenses', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    if (!db) return res.status(503).json({ error: 'Database not available' });
    
    const { amount, category, description, date, recurring, tags } = req.body;
    const expense = {
      userId,
      amount: parseFloat(amount),
      category,
      description,
      date,
      recurring: recurring || false,
      tags: tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.collection('expenses').insertOne(expense)
      .then(result => {
        expense.id = result.insertedId.toString();
        expense._id = result.insertedId;
        res.status(201).json({ expense });
      })
      .catch(error => {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
      });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Update expense
app.put('/expenses/:id', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    const expenseId = req.params.id;
    if (!db) return res.status(503).json({ error: 'Database not available' });
    
    const updates = req.body;
    delete updates.id;
    delete updates._id;
    
    db.collection('expenses').findOneAndUpdate(
      { _id: new ObjectId(expenseId), userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    ).then(result => {
      const doc = result && result.value;
      if (!doc) {
        return res.status(404).json({ error: 'Expense not found' });
      }
      const expense = { ...doc, id: doc._id.toString() };
      res.json({ expense });
    }).catch(error => {
      console.error('Error updating expense:', error);
      res.status(500).json({ error: 'Failed to update expense' });
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// Delete expense
app.delete('/expenses/:id', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    const expenseId = req.params.id;
    if (!db) return res.status(503).json({ error: 'Database not available' });
    
    db.collection('expenses').deleteOne({ _id: new ObjectId(expenseId), userId })
      .then(() => {
        res.json({ success: true });
      })
      .catch(error => {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
      });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// ============= INCOME ENDPOINTS =============

// Get all income for user
app.get('/income', verifyToken, (_req, res) => {
  try {
    const userId = _req.userId;
    if (!db) return res.json({ income: [] });
    
    db.collection('income').find({ userId }).toArray()
      .then(income => {
        const mapped = income.map(inc => ({ ...inc, id: inc._id.toString() }));
        res.json({ income: mapped });
      })
      .catch(error => {
        console.error('Error fetching income:', error);
        res.json({ income: [] });
      });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.json({ income: [] });
  }
});

// Create income
app.post('/income', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    if (!db) return res.status(503).json({ error: 'Database not available' });
    
    const { amount, source, date, description, recurring } = req.body;
    const income = {
      userId,
      amount: parseFloat(amount),
      source,
      date,
      description: description || '',
      recurring: recurring || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    db.collection('income').insertOne(income)
      .then(result => {
        income.id = result.insertedId.toString();
        income._id = result.insertedId;
        res.status(201).json({ income });
      })
      .catch(error => {
        console.error('Error creating income:', error);
        res.status(500).json({ error: 'Failed to create income' });
      });
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ error: 'Failed to create income' });
  }
});

// Update income
app.put('/income/:id', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    const incomeId = req.params.id;
    if (!db) return res.status(503).json({ error: 'Database not available' });
    
    const updates = req.body;
    delete updates.id;
    delete updates._id;
    
    db.collection('income').findOneAndUpdate(
      { _id: new ObjectId(incomeId), userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    ).then(result => {
      const doc = result && result.value;
      if (!doc) {
        return res.status(404).json({ error: 'Income not found' });
      }
      const income = { ...doc, id: doc._id.toString() };
      res.json({ income });
    }).catch(error => {
      console.error('Error updating income:', error);
      res.status(500).json({ error: 'Failed to update income' });
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ error: 'Failed to update income' });
  }
});

// Delete income
app.delete('/income/:id', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    const incomeId = req.params.id;
    if (!db) return res.status(503).json({ error: 'Database not available' });
    
    db.collection('income').deleteOne({ _id: new ObjectId(incomeId), userId })
      .then(() => {
        res.json({ success: true });
      })
      .catch(error => {
        console.error('Error deleting income:', error);
        res.status(500).json({ error: 'Failed to delete income' });
      });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ error: 'Failed to delete income' });
  }
});

// ============= ASSET ENDPOINTS =============

// Get all assets for user
app.get('/assets', verifyToken, (_req, res) => {
  try {
    const userId = _req.userId;
    if (!db) return res.json({ assets: [] });
    
    db.collection('assets').find({ userId }).toArray()
      .then(assets => {
        const mapped = assets.map(asset => ({ ...asset, id: asset._id.toString() }));
        res.json({ assets: mapped });
      })
      .catch(error => {
        console.error('Error fetching assets:', error);
        res.json({ assets: [] });
      });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.json({ assets: [] });
  }
});

// Create asset
app.post('/assets', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    if (!db) return res.status(503).json({ error: 'Database not available' });
    
    const { name, type, currentValue, purchasePrice, purchaseDate, description } = req.body;
    const asset = {
      userId,
      name,
      type,
      currentValue: parseFloat(currentValue),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate,
      description: description || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    db.collection('assets').insertOne(asset)
      .then(result => {
        asset.id = result.insertedId.toString();
        asset._id = result.insertedId;
        res.status(201).json({ asset });
      })
      .catch(error => {
        console.error('Error creating asset:', error);
        res.status(500).json({ error: 'Failed to create asset' });
      });
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// ============= BUDGET ENDPOINTS =============

// Get all budgets for user
app.get('/budgets', verifyToken, (_req, res) => {
  try {
    const userId = _req.userId;
    if (!db) return res.json({ budgets: [] });

    db.collection('budgets').find({ userId }).toArray()
      .then(budgets => {
        const mapped = budgets.map(b => ({ ...b, id: b._id.toString() }));
        res.json({ budgets: mapped });
      })
      .catch(error => {
        console.error('Error fetching budgets:', error);
        res.json({ budgets: [] });
      });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.json({ budgets: [] });
  }
});

// Create budget
app.post('/budgets', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    if (!db) return res.status(503).json({ error: 'Database not available' });

    const { category, limit, period, amount, month } = req.body;
    const budget = {
      userId,
      category,
      limit: parseFloat(limit ?? amount ?? 0),
      period: period ?? month ?? 'monthly',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.collection('budgets').insertOne(budget)
      .then(result => {
        budget.id = result.insertedId.toString();
        budget._id = result.insertedId;
        res.status(201).json({ budget });
      })
      .catch(error => {
        console.error('Error creating budget:', error);
        res.status(500).json({ error: 'Failed to create budget' });
      });
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// ============= BANK ACCOUNT ENDPOINTS =============

// Get all bank accounts for user
app.get('/bank-accounts', verifyToken, (_req, res) => {
  try {
    const userId = _req.userId;
    if (!db) return res.json({ bankAccounts: [] });

    db.collection('bankAccounts').find({ userId }).toArray()
      .then(accounts => {
        const mapped = accounts.map(a => ({ ...a, id: a._id.toString() }));
        res.json({ bankAccounts: mapped });
      })
      .catch(error => {
        console.error('Error fetching bank accounts:', error);
        res.json({ bankAccounts: [] });
      });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.json({ bankAccounts: [] });
  }
});

// Create bank account
app.post('/bank-accounts', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    if (!db) return res.status(503).json({ error: 'Database not available' });

    const { accountName, bankName, accountNumber, accountType, balance, currency } = req.body;
    const bankAccount = {
      userId,
      accountName,
      bankName,
      accountNumber,
      accountType,
      balance: parseFloat(balance ?? 0),
      currency: currency || 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.collection('bankAccounts').insertOne(bankAccount)
      .then(result => {
        bankAccount.id = result.insertedId.toString();
        bankAccount._id = result.insertedId;
        res.status(201).json({ bankAccount });
      })
      .catch(error => {
        console.error('Error creating bank account:', error);
        res.status(500).json({ error: 'Failed to create bank account' });
      });
  } catch (error) {
    console.error('Error creating bank account:', error);
    res.status(500).json({ error: 'Failed to create bank account' });
  }
});

// Update bank account
app.put('/bank-accounts/:id', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    const accountId = req.params.id;
    if (!db) return res.status(503).json({ error: 'Database not available' });

    const updates = req.body;
    delete updates.id;
    delete updates._id;

    db.collection('bankAccounts').findOneAndUpdate(
      { _id: new ObjectId(accountId), userId },
      { $set: { ...updates, updatedAt: new Date() } },
      { returnDocument: 'after' }
    ).then(result => {
      const doc = result && result.value;
      if (!doc) {
        return res.status(404).json({ error: 'Bank account not found' });
      }
      const bankAccount = { ...doc, id: doc._id.toString() };
      res.json({ bankAccount });
    }).catch(error => {
      console.error('Error updating bank account:', error);
      res.status(500).json({ error: 'Failed to update bank account' });
    });
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({ error: 'Failed to update bank account' });
  }
});

// Delete bank account
app.delete('/bank-accounts/:id', verifyToken, (req, res) => {
  try {
    const userId = req.userId;
    const accountId = req.params.id;
    if (!db) return res.status(503).json({ error: 'Database not available' });

    db.collection('bankAccounts').deleteOne({ _id: new ObjectId(accountId), userId })
      .then(() => {
        res.json({ success: true });
      })
      .catch(error => {
        console.error('Error deleting bank account:', error);
        res.status(500).json({ error: 'Failed to delete bank account' });
      });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ error: 'Failed to delete bank account' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

function startServer(port, attemptsLeft = 5) {
  const server = app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && attemptsLeft > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use, trying ${nextPort}...`);
      setTimeout(() => startServer(nextPort, attemptsLeft - 1), 250);
    } else {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  });
}

startServer(DEFAULT_PORT);
