CREATE TABLE `affiliates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20) NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`cedula` varchar(20) NOT NULL,
	`address` text,
	`phone` varchar(30),
	`commissionName` varchar(160),
	`status` enum('activo','inactivo','suspendido') NOT NULL DEFAULT 'activo',
	`qrToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliates_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliate_cedula_unique` UNIQUE(`cedula`)
);
--> statement-breakpoint
CREATE TABLE `assemblies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`assemblyType` enum('ordinaria','extraordinaria','comite') NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`location` varchar(255),
	`qrCode` varchar(500),
	`status` enum('programada','en_curso','finalizada','cancelada') NOT NULL DEFAULT 'programada',
	`notes` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assemblies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `assemblyAttendance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assemblyId` int NOT NULL,
	`affiliateId` int NOT NULL,
	`attended` int NOT NULL DEFAULT 0,
	`checkedInAt` timestamp,
	`method` enum('qr_scan','cedula_manual','lista') DEFAULT 'lista',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `assemblyAttendance_id` PRIMARY KEY(`id`),
	CONSTRAINT `attendance_unique` UNIQUE(`assemblyId`,`affiliateId`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`campaignType` enum('ambiental','salud','cultural','educativa','deportiva','otra') NOT NULL,
	`description` text,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`status` enum('planeada','activa','completada','cancelada') NOT NULL DEFAULT 'planeada',
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `championships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`sport` varchar(120) NOT NULL,
	`championshipType` enum('campeonato','copa','torneo_relampago') NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp,
	`status` enum('inscripcion','en_curso','finalizado','cancelado') NOT NULL DEFAULT 'inscripcion',
	`maxTeams` int,
	`rules` text,
	`createdByUserId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `championships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `affiliate_code_idx` ON `affiliates` (`code`);--> statement-breakpoint
CREATE INDEX `affiliate_status_idx` ON `affiliates` (`status`);--> statement-breakpoint
CREATE INDEX `assembly_scheduled_idx` ON `assemblies` (`scheduledAt`,`status`);--> statement-breakpoint
CREATE INDEX `attendance_assembly_idx` ON `assemblyAttendance` (`assemblyId`,`attended`);--> statement-breakpoint
CREATE INDEX `campaign_status_idx` ON `campaigns` (`status`,`startsAt`);--> statement-breakpoint
CREATE INDEX `championship_status_idx` ON `championships` (`status`,`startsAt`);