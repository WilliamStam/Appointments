<?php
$sql = array(
	"CREATE TABLE `settings` ( `ID` int(6) NOT NULL, `setting` varchar(100) DEFAULT NULL, `data` text);",
	"ALTER TABLE `settings`  ADD PRIMARY KEY (`ID`),  ADD KEY `setting` (`setting`);",
	"ALTER TABLE `settings`  MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;",
	"CREATE TABLE `logs` (  `ID` int(6) NOT NULL,  `appointmentID` int(6) DEFAULT NULL,  `label` varchar(200) DEFAULT NULL,  `data` text);",
	"ALTER TABLE `logs`  ADD PRIMARY KEY (`ID`),  ADD KEY `appointmentID` (`appointmentID`);",
	"ALTER TABLE `logs`  MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;",
	"ALTER TABLE `logs` ADD `eventID` INT(5) NULL DEFAULT NULL AFTER `label`;",
	"ALTER TABLE `logs` CHANGE `eventID` `eventID` VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;",
	"ALTER TABLE `logs` ADD `datein` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP() AFTER `ID`;",
	"CREATE TABLE `notifications` (  `ID` int(6) NOT NULL,  `type` varchar(50) DEFAULT NULL,  `datein` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,  `label` varchar(200) DEFAULT NULL,  `appointmentID` int(6) DEFAULT NULL,  `eventID` varchar(100) DEFAULT NULL,  `log_label` varchar(200) DEFAULT NULL,  `subject` text,  `body` text,  `status` int(3) DEFAULT NULL);",
	"ALTER TABLE `notifications`  ADD PRIMARY KEY (`ID`),  ADD KEY `appointmentID` (`appointmentID`);",
	"ALTER TABLE `notifications`  MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;",


	"ALTER TABLE `appointments` ADD `companyID` INT(6) NULL DEFAULT NULL AFTER `ID`, ADD INDEX (`companyID`);",
	"ALTER TABLE `products` ADD `companyID` INT(6) NULL DEFAULT NULL AFTER `ID`, ADD INDEX (`companyID`);",
	"ALTER TABLE `services` ADD `companyID` INT(6) NULL DEFAULT NULL AFTER `ID`, ADD INDEX (`companyID`);",
	"ALTER TABLE `staff` ADD `companyID` INT(6) NULL DEFAULT NULL AFTER `ID`, ADD INDEX (`companyID`);",
	"ALTER TABLE `users` ADD `lastCompanyID` INT(6) NULL DEFAULT NULL AFTER `settings`, ADD INDEX (`lastCompanyID`);",
	"ALTER TABLE `clients` ADD `companyID` INT(6) NULL DEFAULT NULL AFTER `ID`, ADD INDEX (`companyID`);",

	"CREATE TABLE `companies` (  `ID` int(6) NOT NULL,  `url` varchar(200) DEFAULT NULL,  `company` varchar(200) DEFAULT NULL,  `settings` text);",	"INSERT INTO `companies` (`ID`, `url`, `company`, `settings`) VALUES (1, 'barkstone', 'Barkston Beauty Salon', null), (2, 'impreshin', 'Impreshin', null);",
	"ALTER TABLE `companies`  ADD PRIMARY KEY (`ID`);",
	"ALTER TABLE `companies` MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;",


	"CREATE TABLE `users_companies` (  `ID` int(6) NOT NULL,  `userID` int(6) DEFAULT NULL,  `companyID` int(6) DEFAULT NULL);",
	"ALTER TABLE `users_companies`  ADD PRIMARY KEY (`ID`),  ADD KEY `userID` (`userID`),  ADD KEY `companyID` (`companyID`);",
	"ALTER TABLE `users_companies`  MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;",

	"INSERT INTO `users_companies`(`userID`, `companyID`) (SELECT `ID` AS `userID`, '1' as `companyID` FROM users);",

	"UPDATE `services` SET `companyID`=1;",
	"UPDATE `appointments` SET `companyID`=1;",
	"UPDATE `staff` SET `companyID`=1;",
	"UPDATE `clients` SET `companyID`=1",

	"CREATE TABLE `timeslots` (  `ID` int(6) NOT NULL,  `companyID` int(6) DEFAULT NULL,  `label` varchar(200) DEFAULT NULL,  `start` datetime DEFAULT NULL,  `end` datetime DEFAULT NULL);",

	"ALTER TABLE `timeslots` ADD `repeat_mode` TINYINT(1) NULL DEFAULT '0' AFTER `end`;",
	"ALTER TABLE `timeslots` CHANGE `start` `start` TIME NULL DEFAULT NULL;",
	"ALTER TABLE `timeslots` CHANGE `end` `end` TIME NULL DEFAULT NULL;",


	"ALTER TABLE `timeslots` ADD `repeat_value` TEXT NULL DEFAULT NULL AFTER `repeat_mode`;",

	"ALTER TABLE `timeslots` CHANGE `repeat_value` `data` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;",
	"ALTER TABLE `staff` ADD `services` VARCHAR(250) NULL DEFAULT NULL AFTER `last_name`;",
	"ALTER TABLE `users` ADD `staffID` INT(6) NULL DEFAULT NULL AFTER `settings`;",
	"ALTER TABLE `staff` ADD `colour` VARCHAR(10) NULL DEFAULT NULL AFTER `services`;",
	"ALTER TABLE `appointments_services` ADD `appointmentStart` DATETIME NULL DEFAULT NULL AFTER `serviceID`;",
	"ALTER TABLE `timeslots` ADD `staffID` INT(6) NULL DEFAULT NULL AFTER `data`, ADD `once_off_date` DATETIME NULL DEFAULT NULL AFTER `staffID`;",
	"ALTER TABLE `staff` CHANGE `services` `services` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;",
	"ALTER TABLE `timeslots` CHANGE `once_off_date` `once_off_date` DATE NULL DEFAULT NULL;",
	"ALTER TABLE `staff` CHANGE `colour` `badge_style` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL;",



);

?>
