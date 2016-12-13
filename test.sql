-- phpMyAdmin SQL Dump
-- version 4.6.5.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 01, 2016 at 11:08 AM
-- Server version: 10.1.9-MariaDB
-- PHP Version: 7.0.13

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `ad-server-v3`
--

-- --------------------------------------------------------

--
-- Table structure for table `adverts`
--

CREATE TABLE `adverts` (
	`ID` int(6) NOT NULL,
	`label` varchar(250) DEFAULT NULL,
	`moduleID` int(6) DEFAULT NULL,
	`accountID` int(6) DEFAULT NULL,
	`date_from` datetime DEFAULT NULL,
	`date_to` datetime DEFAULT NULL,
	`description` text,
	`data` text,
	`last_show` datetime DEFAULT NULL,
	`datein` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	`mustContain` text,
	`mustNotContain` text,
	`placements` varchar(250) DEFAULT NULL,
	`method` tinyint(2) DEFAULT '1',
	`budget` decimal(19,4) DEFAULT '0.0000',
	`used` decimal(19,4) DEFAULT '0.0000',
	`rate_clicks` decimal(10,4) DEFAULT NULL,
	`rate_impressions` decimal(10,4) DEFAULT NULL,
	`stats_impressions` int(6) DEFAULT '0',
	`stats_impressions_unique` int(6) DEFAULT '0',
	`stats_clicks` int(6) DEFAULT '0',
	`stats_clicks_unique` int(6) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `adverts`
--


-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
	`ID` int(6) NOT NULL,
	`label` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`ID`, `label`) VALUES
	(1, 'Community'),
	(2, 'Sport'),
	(3, 'Latest News');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
	`ID` int(6) NOT NULL,
	`label` varchar(100) DEFAULT NULL,
	`percentage` int(3) DEFAULT '100'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`ID`, `label`, `percentage`) VALUES
	(1, 'Normal', 100),
	(2, 'Really good', 100),
	(3, 'Really Bad', 100),
	(4, 'slightly good', 100);

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
	`ID` int(6) NOT NULL,
	`module` varchar(100) NOT NULL,
	`enabled` tinyint(1) NOT NULL,
	`rate_impressions` decimal(10,4) DEFAULT NULL,
	`rate_clicks` decimal(10,4) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `rates_sites`
--

CREATE TABLE `rates_sites` (
	`ID` int(6) NOT NULL,
	`moduleID` int(6) DEFAULT NULL,
	`siteID` int(6) DEFAULT NULL,
	`rate_impressions` decimal(10,4) DEFAULT NULL,
	`rate_clicks` decimal(10,4) DEFAULT NULL,
	`last_changed` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `rates_sites`
--

-- --------------------------------------------------------

--
-- Table structure for table `record_clicks`
--

CREATE TABLE `record_clicks` (
	`ID` int(12) NOT NULL,
	`timeKey` int(10) DEFAULT NULL,
	`datein` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`IP` varchar(30) DEFAULT NULL,
	`proxyIP` varchar(30) DEFAULT NULL,
	`HTTP_USER_AGENT` text,
	`moduleID` int(6) DEFAULT NULL,
	`advertID` int(6) DEFAULT NULL,
	`siteID` int(6) DEFAULT NULL,
	`page` varchar(250) DEFAULT NULL,
	`budgetCounted` tinyint(1) DEFAULT '0',
	`country` varchar(100) DEFAULT NULL,
	`country_code` varchar(100) DEFAULT NULL,
	`city` varchar(100) DEFAULT NULL,
	`keywords` text,
	`mustContain` text,
	`mustNotContain` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `record_impressions`
--

CREATE TABLE `record_impressions` (
	`ID` int(12) NOT NULL,
	`timeKey` int(10) DEFAULT NULL,
	`datein` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`IP` varchar(30) DEFAULT NULL,
	`proxyIP` varchar(30) DEFAULT NULL,
	`HTTP_USER_AGENT` text,
	`moduleID` int(6) DEFAULT NULL,
	`advertID` int(6) DEFAULT NULL,
	`siteID` int(6) DEFAULT NULL,
	`page` varchar(250) DEFAULT NULL,
	`budgetCounted` tinyint(1) DEFAULT '0',
	`country` varchar(100) DEFAULT NULL,
	`country_code` varchar(100) DEFAULT NULL,
	`city` varchar(100) DEFAULT NULL,
	`keywords` text,
	`mustContain` text,
	`mustNotContain` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Table structure for table `record_requests`
--

CREATE TABLE `record_requests` (
	`ID` int(11) NOT NULL,
	`timekey` int(8) DEFAULT NULL,
	`datein` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	`moduleID` int(6) DEFAULT NULL,
	`advertID` int(6) DEFAULT NULL,
	`siteID` int(6) DEFAULT NULL,
	`keywords` text,
	`mustContain` text,
	`mustNotContain` text,
	`embedded` tinyint(1) DEFAULT '0',
	`log` text,
	`advert_log` text,
	`page` varchar(250) DEFAULT NULL,
	`data` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `seen_temp`
--

CREATE TABLE `seen_temp` (
	`ID` int(12) NOT NULL,
	`timeKey` varchar(20) DEFAULT NULL,
	`datein` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	`advertID` int(6) DEFAULT NULL,
	`moduleID` int(6) DEFAULT NULL,
	`siteID` int(6) DEFAULT NULL,
	`IP` varchar(30) DEFAULT NULL,
	`proxyIP` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sites`
--

CREATE TABLE `sites` (
	`ID` int(11) NOT NULL,
	`label` varchar(250) DEFAULT NULL,
	`authkey` varchar(100) DEFAULT NULL,
	`categoryIDs` varchar(250) DEFAULT NULL,
	`classID` int(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `sites`
--

INSERT INTO `sites` (`ID`, `label`, `authkey`, `categoryIDs`, `classID`) VALUES
	(1, 'Zoutpansberger', NULL, '1,2', 2),
	(2, 'Limpopo Mirror', NULL, '1,3', 1),
	(3, 'Zoutnet', NULL, '1,2,3', 3),
	(4, 'New Site', NULL, '3', 4);

-- --------------------------------------------------------

--
-- Table structure for table `sites_categories`
--

CREATE TABLE `sites_categories` (
	`ID` int(6) NOT NULL,
	`sitesID` int(6) DEFAULT NULL,
	`groupID` int(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sites_stats_requests`
--

CREATE TABLE `sites_stats_requests` (
	`ID` int(6) NOT NULL,
	`siteID` int(6) DEFAULT NULL,
	`datekey` date DEFAULT NULL,
	`val` int(6) DEFAULT '0',
	`last_update` datetime DEFAULT NULL,
	`moduleID` int(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
	`ID` int(6) NOT NULL,
	`username` varchar(30) DEFAULT NULL,
	`password` varchar(50) DEFAULT NULL,
	`fullname` varchar(30) DEFAULT NULL,
	`settings` text,
	`lastlogin` timestamp NULL DEFAULT NULL,
	`lastActivity` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`ID`, `username`, `password`, `fullname`, `settings`, `lastlogin`, `lastActivity`) VALUES
	(1, 'william', '52d49fece63e5ab2a57cc0f228cf7f35', 'William Stam', '{\"lastpage\":\"\\/admin\\/wards\",\"campaigns\":{\"filter\":{\"site\":\"\",\"account\":\"\",\"dates\":\"2014-04-11 to 2016-05-31\",\"search\":\"\"}},\"sites\":{\"filter\":{\"search\":\"\"}},\"form\":{\"by\":\"site\",\"bysize\":\"14\",\"bysite\":\"10\"},\"archives\":{\"filter\":{\"site\":\"\",\"account\":\"\",\"dates\":\"2014-04-11 to 2016-05-31\",\"search\":\"\"}},\"active\":{\"filter\":{\"site\":\"\",\"account\":\"\",\"search\":\"\"}},\"categories\":{\"filter\":{\"search\":\"\"}},\"users\":{\"filter\":{\"search\":\"\"}},\"accounts\":{\"filter\":{\"search\":\"\"}}}', '2016-07-18 09:59:00', '2016-07-18 13:07:29'),
	(6, 'anton', '0c611c9a8f015c27996d80691331fd48', 'Anton van Zyl', '{\"lastpage\":\"\\/\",\"campaigns\":{\"filter\":{\"site\":\"\",\"account\":\"\",\"dates\":\"2014-04-11 to 2016-05-31\",\"search\":\"\"}},\"sites\":{\"filter\":{\"search\":\"\"}},\"form\":{\"by\":\"size\",\"bysize\":\"\",\"bysite\":\"\"},\"archives\":{\"filter\":{\"site\":\"\",\"account\":\"\",\"dates\":\"2016-01-27 to 2016-02-26\",\"search\":\"\"}},\"active\":{\"filter\":{\"site\":\"\",\"account\":\"\",\"search\":\"\"}},\"categories\":{\"filter\":{\"search\":\"\"}},\"accounts\":{\"filter\":{\"search\":\"\"}}}', '2016-07-13 05:29:41', '2016-07-13 08:00:16'),
	(7, 'isabel', '53f19ea137bf78f5be759c906229fcdd', 'Isabel Venter', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `adverts`
--
ALTER TABLE `adverts`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `accountID` (`accountID`),
	ADD KEY `module` (`moduleID`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
	ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
	ADD PRIMARY KEY (`ID`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
	ADD UNIQUE KEY `ID` (`ID`) USING BTREE,
	ADD KEY `module` (`module`),
	ADD KEY `enabled` (`enabled`);

--
-- Indexes for table `rates_sites`
--
ALTER TABLE `rates_sites`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `module` (`moduleID`),
	ADD KEY `siteID` (`siteID`);

--
-- Indexes for table `record_clicks`
--
ALTER TABLE `record_clicks`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `datein` (`datein`),
	ADD KEY `proxyIP` (`proxyIP`),
	ADD KEY `budgetCounted` (`budgetCounted`),
	ADD KEY `daykey` (`timeKey`),
	ADD KEY `module` (`moduleID`),
	ADD KEY `advertID` (`advertID`),
	ADD KEY `siteID` (`siteID`),
	ADD KEY `timeKey` (`timeKey`);

--
-- Indexes for table `record_impressions`
--
ALTER TABLE `record_impressions`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `datein` (`datein`),
	ADD KEY `proxyIP` (`proxyIP`),
	ADD KEY `budgetCounted` (`budgetCounted`),
	ADD KEY `daykey` (`timeKey`),
	ADD KEY `module` (`moduleID`),
	ADD KEY `advertID` (`advertID`),
	ADD KEY `siteID` (`siteID`),
	ADD KEY `timeKey` (`timeKey`);

--
-- Indexes for table `record_requests`
--
ALTER TABLE `record_requests`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `aID` (`advertID`),
	ADD KEY `dID` (`siteID`),
	ADD KEY `cID` (`moduleID`),
	ADD KEY `daykey` (`timekey`),
	ADD KEY `module` (`moduleID`);

--
-- Indexes for table `seen_temp`
--
ALTER TABLE `seen_temp`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `aID` (`advertID`),
	ADD KEY `dID` (`siteID`),
	ADD KEY `timeKey` (`timeKey`),
	ADD KEY `module` (`moduleID`);

--
-- Indexes for table `sites`
--
ALTER TABLE `sites`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `classID` (`classID`);

--
-- Indexes for table `sites_categories`
--
ALTER TABLE `sites_categories`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `sitesID` (`sitesID`),
	ADD KEY `groupID` (`groupID`);

--
-- Indexes for table `sites_stats_requests`
--
ALTER TABLE `sites_stats_requests`
	ADD PRIMARY KEY (`ID`),
	ADD KEY `siteID` (`siteID`),
	ADD KEY `datekey` (`datekey`),
	ADD KEY `module` (`moduleID`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
	ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `adverts`
--
ALTER TABLE `adverts`
	MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
	MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
	MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
	MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `rates_sites`
--
ALTER TABLE `rates_sites`
	MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `record_clicks`
--
ALTER TABLE `record_clicks`
	MODIFY `ID` int(12) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `record_impressions`
--
ALTER TABLE `record_impressions`
	MODIFY `ID` int(12) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `record_requests`
--
ALTER TABLE `record_requests`
	MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `seen_temp`
--
ALTER TABLE `seen_temp`
	MODIFY `ID` int(12) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `sites`
--
ALTER TABLE `sites`
	MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- AUTO_INCREMENT for table `sites_categories`
--
ALTER TABLE `sites_categories`
	MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `sites_stats_requests`
--
ALTER TABLE `sites_stats_requests`
	MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
	MODIFY `ID` int(6) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;