<?php
$sql = array(
	"CREATE TABLE `settings` ( `ID` int(6) NOT NULL, `setting` varchar(100) DEFAULT NULL, `data` text);",
	"ALTER TABLE `settings`  ADD PRIMARY KEY (`ID`),  ADD KEY `setting` (`setting`);",
	"ALTER TABLE `settings`  MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;"

);

?>
