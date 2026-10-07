import {
  infrastructureFoundationMigration,
} from "./0001InfrastructureFoundation";

export const postgresMigrations = [
  infrastructureFoundationMigration,
] as const;
