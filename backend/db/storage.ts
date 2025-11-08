import { PrismaClient, SessionStatus, TransactionType, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export const db = {
  init: async () => {
    // Prisma does not require explicit init, but we can test connection
    await prisma.$queryRaw`SELECT 1`;
  },
  users: {
    getAll: async () => prisma.user.findMany(),
    getById: async (id: string) => prisma.user.findUnique({ where: { id } }),
    getByUsername: async (username: string) => prisma.user.findUnique({ where: { username } }),
    create: async (user: { id: string; username: string; password: string; role: 'admin' | 'user'; createdAt: Date; }) => {
      const created = await prisma.user.create({
        data: {
          id: user.id,
          username: user.username,
          password: user.password,
          role: user.role as UserRole,
          createdAt: user.createdAt,
        },
      });
      return created;
    },
  },
  products: {
    getAll: async () => prisma.product.findMany(),
    getById: async (id: string) => prisma.product.findUnique({ where: { id } }),
    getByCode: async (code: string, warehouseId?: string) => {
      if (warehouseId) {
        return prisma.product.findFirst({ where: { code, warehouseId } });
      }
      return prisma.product.findFirst({ where: { code } });
    },
    getByWarehouse: async (warehouseId: string) => prisma.product.findMany({ where: { warehouseId } }),
    create: async (product: any) => {
      const created = await prisma.product.create({ data: product });
      return created;
    },
    update: async (id: string, data: any) => {
      const updated = await prisma.product.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
      return updated;
    },
    bulkCreate: async (products: any[]) => {
      await prisma.product.createMany({ data: products, skipDuplicates: true });
      return products;
    },
    clear: async (warehouseId?: string) => {
      if (warehouseId) {
        await prisma.product.deleteMany({ where: { warehouseId } });
      } else {
        await prisma.product.deleteMany();
      }
    },
  },
  transactions: {
    getAll: async () => prisma.transaction.findMany(),
    getByProductId: async (productId: string) => prisma.transaction.findMany({ where: { productId } }),
    getByWarehouse: async (warehouseId: string) => prisma.transaction.findMany({ where: { warehouseId } }),
    create: async (transaction: any) => {
      const created = await prisma.transaction.create({
        data: {
          ...transaction,
          type: (transaction.type || 'count') as TransactionType,
        },
      });
      return created;
    },
  },
  warehouses: {
    getAll: async () => prisma.warehouse.findMany(),
    getById: async (id: string) => prisma.warehouse.findUnique({ where: { id } }),
    getActive: async () => prisma.warehouse.findMany({ where: { isActive: true } }),
    create: async (warehouse: any) => prisma.warehouse.create({ data: warehouse }),
    update: async (id: string, data: any) => prisma.warehouse.update({ where: { id }, data }),
  },
  auditSessions: {
    getAll: async () => prisma.auditSession.findMany(),
    getById: async (id: string) => prisma.auditSession.findUnique({ where: { id } }),
    getByWarehouse: async (warehouseId: string) => prisma.auditSession.findMany({ where: { warehouseId } }),
    getActive: async (warehouseId: string) => prisma.auditSession.findFirst({ where: { warehouseId, status: SessionStatus.active } }),
    create: async (session: any) => prisma.auditSession.create({ data: session }),
    update: async (id: string, data: any) => prisma.auditSession.update({ where: { id }, data }),
  },
  countSessions: {
    getAll: async () => prisma.countSession.findMany(),
    getById: async (id: string) => prisma.countSession.findUnique({ where: { id } }),
    getByAuditSession: async (auditSessionId: string) => prisma.countSession.findMany({ where: { auditSessionId } }),
    create: async (session: any) => prisma.countSession.create({ data: session }),
    update: async (id: string, data: any) => prisma.countSession.update({ where: { id }, data }),
  },
  teams: {
    getAll: async () => prisma.team.findMany(),
    getById: async (id: string) => prisma.team.findUnique({ where: { id } }),
    getByWarehouse: async (warehouseId: string) => prisma.team.findMany({ where: { warehouseId } }),
    create: async (team: any) => prisma.team.create({ data: team }),
    update: async (id: string, data: any) => prisma.team.update({ where: { id }, data }),
  },
  pendingTransactions: {
    getAll: async () => prisma.pendingTransaction.findMany(),
    create: async (pending: any) => prisma.pendingTransaction.create({ data: { id: pending.id, data: pending.transaction, createdAt: pending.createdAt } }),
    remove: async (id: string) => { await prisma.pendingTransaction.delete({ where: { id } }); },
    clear: async () => { await prisma.pendingTransaction.deleteMany(); },
  },
};
