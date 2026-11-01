import {
  infrastructureFoundationMigration,
} from "./0001InfrastructureFoundation";
import {
  commerceCatalogAndOrdersMigration,
} from "./0002CommerceCatalogAndOrders";
import {
  commerceMarketplaceMigration,
} from "./0003CommerceMarketplace";
import {
  commerceBotConfigurationMigration,
} from "./0004CommerceBotConfiguration";
import {
  commerceCampaignConfigurationMigration,
} from "./0005CommerceCampaignConfiguration";

export const postgresMigrations = [
  infrastructureFoundationMigration,
  commerceCatalogAndOrdersMigration,
  commerceMarketplaceMigration,
  commerceBotConfigurationMigration,
  commerceCampaignConfigurationMigration,
] as const;
