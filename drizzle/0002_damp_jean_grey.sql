CREATE TABLE `financialBudgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`periodLabel` varchar(80) NOT NULL,
	`source` varchar(120) NOT NULL,
	`approvedAmount` decimal(14,2) NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialBudgets_id` PRIMARY KEY(`id`),
	CONSTRAINT `financial_budget_period_source_unique` UNIQUE(`periodLabel`,`source`)
);
--> statement-breakpoint
ALTER TABLE `financialMovements` ADD `source` varchar(120) DEFAULT 'Sin fuente' NOT NULL;