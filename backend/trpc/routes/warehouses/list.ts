import { publicProcedure } from "../../create-context";
import { db } from "@/backend/db/storage";

export const listWarehousesProcedure = publicProcedure.query(async () => {
  console.log('[Warehouses] Listing all warehouses');
  const warehouses = await db.warehouses.getAll();
  return warehouses;
});
