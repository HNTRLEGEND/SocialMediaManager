-- CreateTable
CREATE TABLE "CustomerAgentConfig" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "googleSheetId" TEXT NOT NULL,
    "driveFolderId" TEXT,
    "serviceAccountEmail" TEXT NOT NULL,
    "leadAgentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "techAgentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "salesAgentEnabled" BOOLEAN NOT NULL DEFAULT true,
    "serviceAgentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "licenseType" TEXT NOT NULL,
    "activationDate" TIMESTAMP(3) NOT NULL,
    "expirationDate" TIMESTAMP(3),
    "webhookToken" TEXT NOT NULL,
    "webhookBaseUrl" TEXT NOT NULL,
    "openAIApiKey" TEXT NOT NULL,
    "vectorStoreId" TEXT,
    "ragEnabled" BOOLEAN NOT NULL DEFAULT true,
    "companyName" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "replyToEmail" TEXT NOT NULL,
    "logoUrl" TEXT,
    "minBudgetEur" INTEGER NOT NULL DEFAULT 10000,
    "minBantScore" INTEGER NOT NULL DEFAULT 60,
    "autoQualifyScore" INTEGER NOT NULL DEFAULT 85,
    "status" TEXT NOT NULL,
    "lastHealthCheck" TIMESTAMP(3),
    "paEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paEmailManagement" BOOLEAN NOT NULL DEFAULT true,
    "paCalendarManagement" BOOLEAN NOT NULL DEFAULT true,
    "paTaskManagement" BOOLEAN NOT NULL DEFAULT true,
    "paAutoResponse" BOOLEAN NOT NULL DEFAULT true,
    "paAutoResponseThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "paWorkingHoursStart" INTEGER NOT NULL DEFAULT 9,
    "paWorkingHoursEnd" INTEGER NOT NULL DEFAULT 17,
    "paTimezone" TEXT NOT NULL DEFAULT 'Europe/Berlin',
    "paNotifyUrgent" BOOLEAN NOT NULL DEFAULT true,
    "paNotifyChannel" TEXT NOT NULL DEFAULT 'email',
    "paSlackWebhook" TEXT,
    "paTeamsWebhook" TEXT,
    "paEmailTone" TEXT NOT NULL DEFAULT 'professional_friendly',
    "paEmailSignature" TEXT,
    "paOOOEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paOOOStart" TIMESTAMP(3),
    "paOOOEnd" TIMESTAMP(3),
    "paOOOMessage" TEXT,
    "paOOOBackupContact" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerAgentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCatalogConfig" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "models" TEXT NOT NULL,
    "calculationModule" TEXT NOT NULL,
    "basePricing" TEXT,
    "discountRules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCatalogConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SheetMapping" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "logicalName" TEXT NOT NULL,
    "actualSheetName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SheetMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentExecutionLog" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "inquiryId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "durationMs" INTEGER,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "inputData" TEXT,
    "outputData" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentExecutionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAgentConfig_customerId_key" ON "CustomerAgentConfig"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerAgentConfig_webhookToken_key" ON "CustomerAgentConfig"("webhookToken");

-- CreateIndex
CREATE INDEX "CustomerAgentConfig_customerId_idx" ON "CustomerAgentConfig"("customerId");

-- CreateIndex
CREATE INDEX "CustomerAgentConfig_status_idx" ON "CustomerAgentConfig"("status");

-- CreateIndex
CREATE INDEX "ProductCatalogConfig_customerId_idx" ON "ProductCatalogConfig"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogConfig_customerId_category_key" ON "ProductCatalogConfig"("customerId", "category");

-- CreateIndex
CREATE INDEX "SheetMapping_customerId_idx" ON "SheetMapping"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "SheetMapping_customerId_logicalName_key" ON "SheetMapping"("customerId", "logicalName");

-- CreateIndex
CREATE INDEX "AgentExecutionLog_customerId_agentName_idx" ON "AgentExecutionLog"("customerId", "agentName");

-- CreateIndex
CREATE INDEX "AgentExecutionLog_status_idx" ON "AgentExecutionLog"("status");

-- CreateIndex
CREATE INDEX "AgentExecutionLog_createdAt_idx" ON "AgentExecutionLog"("createdAt");

-- AddForeignKey
ALTER TABLE "CustomerAgentConfig" ADD CONSTRAINT "CustomerAgentConfig_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
