import { Database, User, Product, Transaction } from '../types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_KEY = 'inventory_database';

let database: Database = {
  users: [],
  products: [],
  transactions: [],
};

let isInitialized = false;

async function loadDatabase() {
  if (isInitialized) return;
  
  try {
    const stored = await AsyncStorage.getItem(DB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      database = {
        users: parsed.users || [],
        products: parsed.products || [],
        transactions: parsed.transactions || [],
      };
      console.log('[DB] Loaded database:', {
        users: database.users.length,
        products: database.products.length,
        transactions: database.transactions.length
      });
    } else {
      console.log('[DB] No stored database found, starting fresh');
    }
  } catch (error) {
    console.error('[DB] Error loading database:', error);
  }
  isInitialized = true;
}

async function saveDatabase() {
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(database));
    console.log('[DB] Database saved');
  } catch (error) {
    console.error('[DB] Error saving database:', error);
  }
}

export const db = {
  init: loadDatabase,
  users: {
    getAll: async () => {
      await loadDatabase();
      return database.users;
    },
    getById: async (id: string) => {
      await loadDatabase();
      return database.users.find(u => u.id === id);
    },
    getByUsername: async (username: string) => {
      await loadDatabase();
      return database.users.find(u => u.username === username);
    },
    create: async (user: User) => {
      await loadDatabase();
      database.users.push(user);
      await saveDatabase();
      console.log('[DB] User created:', user.username);
      return user;
    },
  },
  products: {
    getAll: async () => {
      await loadDatabase();
      return database.products;
    },
    getById: async (id: string) => {
      await loadDatabase();
      return database.products.find(p => p.id === id);
    },
    getByCode: async (code: string) => {
      await loadDatabase();
      return database.products.find(p => p.code === code);
    },
    create: async (product: Product) => {
      await loadDatabase();
      database.products.push(product);
      await saveDatabase();
      return product;
    },
    update: async (id: string, data: Partial<Product>) => {
      await loadDatabase();
      const index = database.products.findIndex(p => p.id === id);
      if (index !== -1) {
        database.products[index] = { ...database.products[index], ...data, updatedAt: new Date() };
        await saveDatabase();
        return database.products[index];
      }
      return null;
    },
    bulkCreate: async (products: Product[]) => {
      await loadDatabase();
      database.products = [...database.products, ...products];
      await saveDatabase();
      console.log('[DB] Bulk created products:', products.length);
      return products;
    },
    clear: async () => {
      await loadDatabase();
      database.products = [];
      await saveDatabase();
      console.log('[DB] Products cleared');
    },
  },
  transactions: {
    getAll: async () => {
      await loadDatabase();
      return database.transactions;
    },
    getByProductId: async (productId: string) => {
      await loadDatabase();
      return database.transactions.filter(t => t.productId === productId);
    },
    create: async (transaction: Transaction) => {
      await loadDatabase();
      database.transactions.push(transaction);
      await saveDatabase();
      console.log('[DB] Transaction created:', transaction.type, transaction.productCode);
      return transaction;
    },
  },
};
