export interface User {
  id: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  currentStock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  type: 'count' | 'in' | 'out';
  quantity: number;
  previousStock: number;
  newStock: number;
  userId: string;
  username: string;
  createdAt: Date;
}

export interface Database {
  users: User[];
  products: Product[];
  transactions: Transaction[];
}
