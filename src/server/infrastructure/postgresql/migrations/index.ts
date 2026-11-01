import {
  infrastructureFoundationMigration,
} from "./0001InfrastructureFoundation";
import {
  commerceCatalogAndOrdersMigration,
} from "./0002CommerceCatalogAndOrders";
import {
  commerceMarketplaceMigration,
} from "./0003CommerceMarketplace";

export const postgresMigrations = [
  infrastructureFoundationMigration,
  commerceCatalogAndOrdersMigration,
  commerceMarketplaceMigration,
] as const;
