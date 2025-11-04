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
});

export type AppRouter = typeof appRouter;
