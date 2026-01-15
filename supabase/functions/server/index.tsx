import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Create Supabase client for auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper to verify user authentication
async function verifyUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  console.log('[verifyUser] Auth header:', authHeader ? `Bearer ${authHeader.substring(0, 30)}...` : 'MISSING');
  
  const accessToken = authHeader?.split(' ')[1];
  if (!accessToken) {
    console.log('[verifyUser] No access token found');
    return null;
  }
  
  console.log('[verifyUser] Supabase client initialized:', !!supabase);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error) {
    console.log('[verifyUser] Auth error:', error.message);
    return null;
  }
  if (!user) {
    console.log('[verifyUser] No user found for token');
    return null;
  }
  
  console.log('[verifyUser] User verified:', user.id);
  return user.id;
}

// Health check endpoint
app.get("/make-server-bb49b778/health", (c) => {
  return c.json({ status: "ok" });
});

// ============= AUTH ENDPOINTS =============

// Signup endpoint
app.post("/make-server-bb49b778/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Signup error: ${error}`);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// ============= EXPENSE ENDPOINTS =============

// Get all expenses for user
app.get("/make-server-bb49b778/expenses", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const expenses = await kv.getByPrefix(`expense:${userId}:`);
    return c.json({ expenses: expenses || [] });
  } catch (error) {
    console.log(`Error fetching expenses: ${error}`);
    return c.json({ error: 'Failed to fetch expenses' }, 500);
  }
});

// Create expense
app.post("/make-server-bb49b778/expenses", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const expenseData = await c.req.json();
    const expenseId = crypto.randomUUID();
    const expense = {
      id: expenseId,
      userId,
      ...expenseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`expense:${userId}:${expenseId}`, expense);
    return c.json({ expense });
  } catch (error) {
    console.log(`Error creating expense: ${error}`);
    return c.json({ error: 'Failed to create expense' }, 500);
  }
});

// Update expense
app.put("/make-server-bb49b778/expenses/:id", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const expenseId = c.req.param('id');
    const existing = await kv.get(`expense:${userId}:${expenseId}`);
    
    if (!existing) {
      return c.json({ error: 'Expense not found' }, 404);
    }

    const updates = await c.req.json();
    const expense = {
      ...existing,
      ...updates,
      id: expenseId,
      userId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`expense:${userId}:${expenseId}`, expense);
    return c.json({ expense });
  } catch (error) {
    console.log(`Error updating expense: ${error}`);
    return c.json({ error: 'Failed to update expense' }, 500);
  }
});

// Delete expense
app.delete("/make-server-bb49b778/expenses/:id", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const expenseId = c.req.param('id');
    await kv.del(`expense:${userId}:${expenseId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting expense: ${error}`);
    return c.json({ error: 'Failed to delete expense' }, 500);
  }
});

// ============= INCOME ENDPOINTS =============

// Get all income for user
app.get("/make-server-bb49b778/income", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const income = await kv.getByPrefix(`income:${userId}:`);
    return c.json({ income: income || [] });
  } catch (error) {
    console.log(`Error fetching income: ${error}`);
    return c.json({ error: 'Failed to fetch income' }, 500);
  }
});

// Create income
app.post("/make-server-bb49b778/income", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const incomeData = await c.req.json();
    const incomeId = crypto.randomUUID();
    const income = {
      id: incomeId,
      userId,
      ...incomeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`income:${userId}:${incomeId}`, income);
    return c.json({ income });
  } catch (error) {
    console.log(`Error creating income: ${error}`);
    return c.json({ error: 'Failed to create income' }, 500);
  }
});

// Update income
app.put("/make-server-bb49b778/income/:id", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const incomeId = c.req.param('id');
    const existing = await kv.get(`income:${userId}:${incomeId}`);
    
    if (!existing) {
      return c.json({ error: 'Income not found' }, 404);
    }

    const updates = await c.req.json();
    const income = {
      ...existing,
      ...updates,
      id: incomeId,
      userId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`income:${userId}:${incomeId}`, income);
    return c.json({ income });
  } catch (error) {
    console.log(`Error updating income: ${error}`);
    return c.json({ error: 'Failed to update income' }, 500);
  }
});

// Delete income
app.delete("/make-server-bb49b778/income/:id", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const incomeId = c.req.param('id');
    await kv.del(`income:${userId}:${incomeId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting income: ${error}`);
    return c.json({ error: 'Failed to delete income' }, 500);
  }
});

// ============= ASSET ENDPOINTS =============

// Get all assets for user
app.get("/make-server-bb49b778/assets", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assets = await kv.getByPrefix(`asset:${userId}:`);
    return c.json({ assets: assets || [] });
  } catch (error) {
    console.log(`Error fetching assets: ${error}`);
    return c.json({ error: 'Failed to fetch assets' }, 500);
  }
});

// Create asset
app.post("/make-server-bb49b778/assets", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assetData = await c.req.json();
    const assetId = crypto.randomUUID();
    const asset = {
      id: assetId,
      userId,
      ...assetData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`asset:${userId}:${assetId}`, asset);
    return c.json({ asset });
  } catch (error) {
    console.log(`Error creating asset: ${error}`);
    return c.json({ error: 'Failed to create asset' }, 500);
  }
});

// Update asset
app.put("/make-server-bb49b778/assets/:id", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assetId = c.req.param('id');
    const existing = await kv.get(`asset:${userId}:${assetId}`);
    
    if (!existing) {
      return c.json({ error: 'Asset not found' }, 404);
    }

    const updates = await c.req.json();
    const asset = {
      ...existing,
      ...updates,
      id: assetId,
      userId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`asset:${userId}:${assetId}`, asset);
    return c.json({ asset });
  } catch (error) {
    console.log(`Error updating asset: ${error}`);
    return c.json({ error: 'Failed to update asset' }, 500);
  }
});

// Delete asset
app.delete("/make-server-bb49b778/assets/:id", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const assetId = c.req.param('id');
    await kv.del(`asset:${userId}:${assetId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting asset: ${error}`);
    return c.json({ error: 'Failed to delete asset' }, 500);
  }
});

// ============= BUDGET ENDPOINTS =============

// Get all budgets for user
app.get("/make-server-bb49b778/budgets", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const budgets = await kv.getByPrefix(`budget:${userId}:`);
    return c.json({ budgets: budgets || [] });
  } catch (error) {
    console.log(`Error fetching budgets: ${error}`);
    return c.json({ error: 'Failed to fetch budgets' }, 500);
  }
});

// Create or update budget
app.post("/make-server-bb49b778/budgets", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const budgetData = await c.req.json();
    const budgetId = budgetData.id || crypto.randomUUID();
    const budget = {
      id: budgetId,
      userId,
      ...budgetData,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`budget:${userId}:${budgetId}`, budget);
    return c.json({ budget });
  } catch (error) {
    console.log(`Error saving budget: ${error}`);
    return c.json({ error: 'Failed to save budget' }, 500);
  }
});

// Delete budget
app.delete("/make-server-bb49b778/budgets/:id", async (c) => {
  const userId = await verifyUser(c.req.raw);
  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const budgetId = c.req.param('id');
    await kv.del(`budget:${userId}:${budgetId}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting budget: ${error}`);
    return c.json({ error: 'Failed to delete budget' }, 500);
  }
});

Deno.serve(app.fetch);