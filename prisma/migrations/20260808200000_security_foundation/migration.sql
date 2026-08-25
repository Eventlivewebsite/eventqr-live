-- Security foundation: storage accounting and 15-day default retention.
ALTER TABLE "Client"
ADD COLUMN "storageUsedGB" DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE "Client"
ALTER COLUMN "storageDays" SET DEFAULT 15;
