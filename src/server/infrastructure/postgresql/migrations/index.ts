import {
  infrastructureFoundationMigration,
} from "./0001InfrastructureFoundation";
import {
  commerceCatalogAndOrdersMigration,
} from "./0002CommerceCatalogAndOrders";

export const postgresMigrations = [
  infrastructureFoundationMigration,
  commerceCatalogAndOrdersMigration,
] as const;
