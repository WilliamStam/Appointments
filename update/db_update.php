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


);

?>
