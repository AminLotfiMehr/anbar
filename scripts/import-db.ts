import { PrismaClient, UserRole, SessionStatus, TransactionType } from '@prisma/client';
import { readFile } from 'fs/promises';

async function main() {
  const prisma = new PrismaClient();
  const path = new URL('../database.json', import.meta.url);
  const raw = await readFile(path, 'utf-8');
  const data = JSON.parse(raw);

  console.log('Import start...');

  // Users
  for (const u of data.users || []) {
    await prisma.user.upsert({
      where: { username: u.username },
      create: {
        id: u.id,
        username: u.username,
        password: u.password,
        role: (u.role || 'user') as UserRole,
        createdAt: new Date(u.createdAt || Date.now()),
      },
      update: {},
    });
  }
  console.log('Users imported');

  // Warehouses
  for (const w of data.warehouses || []) {
    await prisma.warehouse.upsert({
      where: { id: w.id },
      create: {
        id: w.id,
        name: w.name,
        description: w.description || null,
        isActive: !!w.isActive,
        createdAt: new Date(w.createdAt || Date.now()),
      },
      update: {},
    });
  }
  console.log('Warehouses imported');

  // Products - strictly require warehouseId
  for (const p of data.products || []) {
    if (!p.warehouseId) {
      console.warn('[seed] Skipping product without warehouseId:', p.id, p.code);
      continue;
    }
    const wh = await prisma.warehouse.findUnique({ where: { id: p.warehouseId } });
    if (!wh) {
      console.warn('[seed] Skipping product; warehouse not found:', p.id, p.warehouseId);
      continue;
    }
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        code: p.code,
        name: p.name,
        currentStock: p.currentStock ?? 0,
        createdAt: new Date(p.createdAt || Date.now()),
        updatedAt: new Date(p.updatedAt || Date.now()),
        warehouse: { connect: { id: p.warehouseId } },
      },
      update: {
        currentStock: p.currentStock ?? 0,
        updatedAt: new Date(),
      },
    });
  }
  console.log('Products imported');

  // AuditSessions - strictly require warehouseId
  for (const s of data.auditSessions || []) {
    if (!s.warehouseId) {
      console.warn('[seed] Skipping auditSession without warehouseId:', s.id);
      continue;
    }
    const wh = await prisma.warehouse.findUnique({ where: { id: s.warehouseId } });
    if (!wh) {
      console.warn('[seed] Skipping auditSession; warehouse not found:', s.id, s.warehouseId);
      continue;
    }
    await prisma.auditSession.upsert({
      where: { id: s.id },
      create: {
        id: s.id,
        warehouseId: s.warehouseId,
        name: s.name,
        status: (s.status || 'active') as SessionStatus,
        allowOutflow: !!s.allowOutflow,
        createdAt: new Date(s.createdAt || Date.now()),
        completedAt: s.completedAt ? new Date(s.completedAt) : null,
      },
      update: {},
    });
  }
  console.log('Audit sessions imported');

  // Teams - strictly require warehouseId
  for (const t of data.teams || []) {
    if (!t.warehouseId) {
      console.warn('[seed] Skipping team without warehouseId:', t.id);
      continue;
    }
    const wh = await prisma.warehouse.findUnique({ where: { id: t.warehouseId } });
    if (!wh) {
      console.warn('[seed] Skipping team; warehouse not found:', t.id, t.warehouseId);
      continue;
    }
    await prisma.team.upsert({
      where: { id: t.id },
      create: {
        id: t.id,
        name: t.name,
        warehouseId: t.warehouseId,
        memberIds: (t.memberIds || []) as string[],
        createdAt: new Date(t.createdAt || Date.now()),
      },
      update: {},
    });
  }
  console.log('Teams imported');

  // CountSessions
  for (const cs of data.countSessions || []) {
    if (!cs.auditSessionId || !cs.teamId) {
      console.warn('[seed] Skipping countSession missing refs:', cs.id);
      continue;
    }
    const audit = await prisma.auditSession.findUnique({ where: { id: cs.auditSessionId } });
    const team = await prisma.team.findUnique({ where: { id: cs.teamId } });
    if (!audit || !team) {
      console.warn('[seed] Skipping countSession; related records missing:', cs.id);
      continue;
    }
    await prisma.countSession.upsert({
      where: { id: cs.id },
      create: {
        id: cs.id,
        auditSessionId: cs.auditSessionId,
        teamId: cs.teamId,
        name: cs.name,
        status: (cs.status || 'active') as SessionStatus,
        createdAt: new Date(cs.createdAt || Date.now()),
        completedAt: cs.completedAt ? new Date(cs.completedAt) : null,
      },
      update: {},
    });
  }
  console.log('Count sessions imported');

  // Transactions
  for (const tr of data.transactions || []) {
    if (!tr.productId || !tr.warehouseId || !tr.userId) {
      console.warn('[seed] Skipping transaction missing refs:', tr.id);
      continue;
    }
    const prod = await prisma.product.findUnique({ where: { id: tr.productId } });
    const wh = await prisma.warehouse.findUnique({ where: { id: tr.warehouseId } });
    const usr = await prisma.user.findUnique({ where: { id: tr.userId } });
    if (!prod || !wh || !usr) {
      console.warn('[seed] Skipping transaction; related records missing:', tr.id);
      continue;
    }
    await prisma.transaction.upsert({
      where: { id: tr.id },
      create: {
        id: tr.id,
        productId: tr.productId,
        productCode: tr.productCode,
        productName: tr.productName,
        warehouseId: tr.warehouseId,
        type: (tr.type || 'count') as TransactionType,
        quantity: tr.quantity ?? 0,
        previousStock: tr.previousStock ?? 0,
        newStock: tr.newStock ?? 0,
        userId: tr.userId,
        username: tr.username,
        auditSessionId: tr.auditSessionId || null,
        countSessionId: tr.countSessionId || null,
        isSynced: !!tr.isSynced,
        createdAt: new Date(tr.createdAt || Date.now()),
      },
      update: {},
    });
  }
  console.log('Transactions imported');

  // PendingTransactions -> store as JSON
  for (const pt of data.pendingTransactions || []) {
    await prisma.pendingTransaction.upsert({
      where: { id: pt.id },
      create: {
        id: pt.id,
        data: pt.transaction,
        createdAt: new Date(pt.createdAt || Date.now()),
      },
      update: {},
    });
  }
  console.log('Pending transactions imported');

  await prisma.$disconnect();
  console.log('Import finished');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
