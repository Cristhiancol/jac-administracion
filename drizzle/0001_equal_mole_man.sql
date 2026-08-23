CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(160) NOT NULL,
	`purpose` text,
	`coordinatorUserId` int,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`),
	CONSTRAINT `commission_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `facilityReservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestedByUserId` int NOT NULL,
	`eventName` varchar(255) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`applicantType` enum('afiliado','vecino','externo') NOT NULL,
	`amount` decimal(14,2) NOT NULL DEFAULT '0.00',
	`status` enum('solicitada','aprobada','rechazada','cancelada') NOT NULL DEFAULT 'solicitada',
	`receiptUrl` varchar(1000),
	`reviewedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facilityReservations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financialMovements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`movementType` enum('ingreso','egreso') NOT NULL,
	`category` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(14,2) NOT NULL,
	`occurredAt` timestamp NOT NULL,
	`activityId` int,
	`supportUrl` varchar(1000),
	`recordedByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financialMovements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `institutionalNewsItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceId` int NOT NULL,
	`externalId` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`summary` text,
	`sourceUrl` varchar(1000) NOT NULL,
	`publishedAt` timestamp,
	`retrievedAt` timestamp NOT NULL DEFAULT (now()),
	`validationStatus` enum('pendiente','verificado','observado') NOT NULL DEFAULT 'pendiente',
	CONSTRAINT `institutionalNewsItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `news_item_external_unique` UNIQUE(`sourceId`,`externalId`)
);
--> statement-breakpoint
CREATE TABLE `institutionalNewsSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sourceUrl` varchar(1000) NOT NULL,
	`official` int NOT NULL DEFAULT 0,
	`validationStatus` enum('pendiente','verificado','observado') NOT NULL DEFAULT 'pendiente',
	`scheduleCronTaskUid` varchar(65),
	`lastCheckedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutionalNewsSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `institutionalProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`legalName` varchar(255) NOT NULL,
	`nit` varchar(20),
	`officialAddress` text,
	`neighborhood` varchar(160),
	`locality` varchar(120) NOT NULL DEFAULT 'Usme',
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`verificationStatus` enum('pendiente','verificado','observado') NOT NULL DEFAULT 'pendiente',
	`verificationSourceUrl` varchar(1000),
	`verificationNotes` text,
	`verifiedAt` timestamp,
	`verifiedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `institutionalProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `legalObligations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`obligationType` varchar(120) NOT NULL,
	`legalReference` varchar(255) NOT NULL,
	`receivingEntity` varchar(160),
	`recurrence` enum('unica','anual','semestral','trimestral') NOT NULL DEFAULT 'unica',
	`dueAt` timestamp NOT NULL,
	`responsibleUserId` int,
	`status` enum('pendiente','en_proceso','cumplida','vencida') NOT NULL DEFAULT 'pendiente',
	`supportUrl` varchar(1000),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `legalObligations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workPlanActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workPlanId` int NOT NULL,
	`commissionId` int,
	`responsibleUserId` int,
	`title` varchar(255) NOT NULL,
	`goal` text NOT NULL,
	`description` text,
	`status` enum('pendiente','en_proceso','completada','bloqueada') NOT NULL DEFAULT 'pendiente',
	`progress` int NOT NULL DEFAULT 0,
	`dueAt` timestamp NOT NULL,
	`evidenceUrl` varchar(1000),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workPlanActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`periodLabel` varchar(80) NOT NULL,
	`objective` text NOT NULL,
	`status` enum('borrador','activo','cerrado') NOT NULL DEFAULT 'borrador',
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `jacRole` enum('directiva','coordinador_comite','tesorero_fiscal','secretario','afiliado') DEFAULT 'afiliado' NOT NULL;--> statement-breakpoint
CREATE INDEX `facility_reservation_range_idx` ON `facilityReservations` (`startsAt`,`endsAt`,`status`);--> statement-breakpoint
CREATE INDEX `financial_movement_period_idx` ON `financialMovements` (`occurredAt`,`movementType`);--> statement-breakpoint
CREATE INDEX `news_item_published_idx` ON `institutionalNewsItems` (`publishedAt`);--> statement-breakpoint
CREATE INDEX `news_source_task_idx` ON `institutionalNewsSources` (`scheduleCronTaskUid`);--> statement-breakpoint
CREATE INDEX `institutional_profile_status_idx` ON `institutionalProfiles` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `legal_obligation_due_idx` ON `legalObligations` (`dueAt`,`status`);--> statement-breakpoint
CREATE INDEX `activity_plan_idx` ON `workPlanActivities` (`workPlanId`,`status`);--> statement-breakpoint
CREATE INDEX `activity_commission_idx` ON `workPlanActivities` (`commissionId`,`dueAt`);--> statement-breakpoint
CREATE INDEX `work_plan_period_idx` ON `workPlans` (`periodLabel`,`status`);