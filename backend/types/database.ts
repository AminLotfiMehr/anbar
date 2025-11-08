export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  warehouseId: string;
  currentStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  warehouseId: string;
  type: 'count' | 'in' | 'out';
  quantity: number;
  previousStock: number;
  newStock: number;
  userId: string;
  username: string;
  auditSessionId?: string;
  countSessionId?: string;
  isSynced: boolean;
  createdAt: Date;
}

export interface AuditSession {
  id: string;
  warehouseId: string;
  name: string;
  status: 'active' | 'completed';
  allowOutflow: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface CountSession {
  id: string;
  auditSessionId: string;
  teamId: string;
  name: string;
  status: 'active' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

export interface Team {
  id: string;
  name: string;
  warehouseId: string;
  memberIds: string[];
  createdAt: Date;
}

export interface PendingTransaction {
  id: string;
  transaction: Transaction;
  createdAt: Date;
}

export interface Database {
  users: User[];
  warehouses: Warehouse[];
  products: Product[];
  transactions: Transaction[];
  auditSessions: AuditSession[];
  countSessions: CountSession[];
  teams: Team[];
  pendingTransactions: PendingTransaction[];
}
