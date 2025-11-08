import { createTRPCRouter } from "./create-context";
import { registerProcedure } from "./routes/auth/register";
import { loginProcedure } from "./routes/auth/login";
import { listProductsProcedure } from "./routes/products/list";
import { getProductByCodeProcedure } from "./routes/products/get-by-code";
import { uploadExcelProcedure } from "./routes/products/upload-excel";
import { countInventoryProcedure } from "./routes/inventory/count";
import { confirmCountProcedure } from "./routes/inventory/confirm-count";
import { outflowProcedure } from "./routes/inventory/outflow";
import { listTransactionsProcedure } from "./routes/transactions/list";
import { listWarehousesProcedure } from "./routes/warehouses/list";
import { createWarehouseProcedure } from "./routes/warehouses/create";
import { updateWarehouseProcedure } from "./routes/warehouses/update";
import { createAuditSessionProcedure } from "./routes/audit-sessions/create";
import { listAuditSessionsProcedure } from "./routes/audit-sessions/list";
import { getActiveAuditSessionProcedure } from "./routes/audit-sessions/get-active";
import { completeAuditSessionProcedure } from "./routes/audit-sessions/complete";
import { createTeamProcedure } from "./routes/teams/create";
import { listTeamsProcedure } from "./routes/teams/list";
import { createCountSessionProcedure } from "./routes/count-sessions/create";
import { listCountSessionsProcedure } from "./routes/count-sessions/list";
import { listUsersProcedure } from "./routes/admin/list-users";
import { createUserProcedure } from "./routes/admin/create-user";
import { getReportsProcedure } from "./routes/admin/get-reports";
import { deleteWarehouseProcedure } from "./routes/admin/delete-warehouse";

export const appRouter = createTRPCRouter({
  auth: createTRPCRouter({
    register: registerProcedure,
    login: loginProcedure,
  }),
  products: createTRPCRouter({
    list: listProductsProcedure,
    getByCode: getProductByCodeProcedure,
    uploadExcel: uploadExcelProcedure,
  }),
  inventory: createTRPCRouter({
    count: countInventoryProcedure,
    confirmCount: confirmCountProcedure,
    outflow: outflowProcedure,
  }),
  transactions: createTRPCRouter({
    list: listTransactionsProcedure,
  }),
  warehouses: createTRPCRouter({
    list: listWarehousesProcedure,
    create: createWarehouseProcedure,
    update: updateWarehouseProcedure,
  }),
  auditSessions: createTRPCRouter({
    create: createAuditSessionProcedure,
    list: listAuditSessionsProcedure,
    getActive: getActiveAuditSessionProcedure,
    complete: completeAuditSessionProcedure,
  }),
  teams: createTRPCRouter({
    create: createTeamProcedure,
    list: listTeamsProcedure,
  }),
  countSessions: createTRPCRouter({
    create: createCountSessionProcedure,
    list: listCountSessionsProcedure,
  }),
  admin: createTRPCRouter({
    listUsers: listUsersProcedure,
    createUser: createUserProcedure,
    getReports: getReportsProcedure,
    deleteWarehouse: deleteWarehouseProcedure,
  }),
});

export type AppRouter = typeof appRouter;
