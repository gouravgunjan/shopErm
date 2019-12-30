CREATE DATABASE  IF NOT EXISTS `inventorymanagement` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inventorymanagement`;
-- MySQL dump 10.13  Distrib 8.0.17, for Win64 (x86_64)
--
-- Host: localhost    Database: inventorymanagement
-- ------------------------------------------------------
-- Server version	8.0.17

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bill_entry`
--

DROP TABLE IF EXISTS `bill_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_entry` (
  `billId` int(11) NOT NULL AUTO_INCREMENT,
  `billEntryId` int(11) NOT NULL,
  `menuItem` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `quantity` decimal(10,0) NOT NULL,
  PRIMARY KEY (`billId`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_entry`
--

LOCK TABLES `bill_entry` WRITE;
/*!40000 ALTER TABLE `bill_entry` DISABLE KEYS */;
INSERT INTO `bill_entry` VALUES (2,1,'Chicken',5),(3,2,'Chowmein',1),(11,3,'Paneer',2),(12,4,'Chicken',1),(14,4,'Chowmein',3),(15,5,'Paneer',2),(16,5,'Chicken',1),(19,6,'Paneer',2),(20,6,'Chicken',1),(21,7,'Paneer',2),(22,7,'Chicken',2),(23,8,'Chicken',1),(26,9,'Chicken',1),(28,10,'Chicken',1);
/*!40000 ALTER TABLE `bill_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bill_repo`
--

DROP TABLE IF EXISTS `bill_repo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bill_repo` (
  `billEntryId` int(11) NOT NULL AUTO_INCREMENT,
  `isComplete` bit(1) NOT NULL,
  `customerType` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `startTime` datetime NOT NULL,
  `entryUser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `promoCode` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `endTime` datetime DEFAULT NULL,
  PRIMARY KEY (`billEntryId`),
  KEY `fkEntryUser_idx` (`entryUser`),
  KEY `fk_promo_billRepo_idx` (`promoCode`),
  KEY `endTime_stamp` (`endTime`) /*!80000 INVISIBLE */,
  CONSTRAINT `fkEntryUser_billRepo` FOREIGN KEY (`entryUser`) REFERENCES `user_repo` (`userId`) ON UPDATE CASCADE,
  CONSTRAINT `fk_promo_billRepo` FOREIGN KEY (`promoCode`) REFERENCES `promo_repo` (`promoCode`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bill_repo`
--

LOCK TABLES `bill_repo` WRITE;
/*!40000 ALTER TABLE `bill_repo` DISABLE KEYS */;
INSERT INTO `bill_repo` VALUES (1,_binary '','Swiggy','2019-08-10 01:26:37','gourav','TEST10','2019-09-10 13:31:48'),(2,_binary '','Table 3','2019-08-10 01:26:48','gourav',NULL,'2019-09-10 13:31:53'),(3,_binary '','Table 1','2019-08-10 14:38:37','gourav','TEST10','2019-09-10 13:31:58'),(4,_binary '','Table 2','2019-08-10 14:40:21','gourav',NULL,'2019-09-10 13:32:04'),(5,_binary '','Table 3','2019-08-10 15:25:52','gourav',NULL,'2019-09-10 13:32:08'),(6,_binary '','Table 3','2019-09-10 15:36:52','gourav',NULL,'2019-09-10 15:37:44'),(7,_binary '','Table 1','2019-09-19 21:35:44','gourav',NULL,'2019-09-19 21:36:07'),(8,_binary '','Table 3','2019-12-15 17:19:35','gourav',NULL,'2019-12-15 17:36:10'),(9,_binary '','Table 2','2019-12-15 17:37:44','gourav',NULL,'2019-12-15 17:37:54'),(10,_binary '','Table 2','2019-12-15 17:39:44','gourav',NULL,'2019-12-15 17:39:57');
/*!40000 ALTER TABLE `bill_repo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_repo`
--

DROP TABLE IF EXISTS `inventory_repo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_repo` (
  `inventoryId` int(11) NOT NULL AUTO_INCREMENT,
  `inventoryName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `inventoryDescription` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `inventoryCode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`inventoryId`),
  UNIQUE KEY `inventory_code_UNIQUE` (`inventoryCode`),
  UNIQUE KEY `inventoryId_UNIQUE` (`inventoryId`),
  UNIQUE KEY `idx_inventory_repo_inventoryName` (`inventoryName`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_repo`
--

LOCK TABLES `inventory_repo` WRITE;
/*!40000 ALTER TABLE `inventory_repo` DISABLE KEYS */;
INSERT INTO `inventory_repo` VALUES (1,'Paneer',NULL,'105');
/*!40000 ALTER TABLE `inventory_repo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `login_entry`
--

DROP TABLE IF EXISTS `login_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login_entry` (
  `userId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `loginTimeStamp` datetime NOT NULL,
  `logoutTimeStamp` datetime DEFAULT NULL,
  PRIMARY KEY (`loginTimeStamp`),
  KEY `fkUserId_idx` (`userId`),
  CONSTRAINT `fkUserId` FOREIGN KEY (`userId`) REFERENCES `user_repo` (`userId`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `login_entry`
--

LOCK TABLES `login_entry` WRITE;
/*!40000 ALTER TABLE `login_entry` DISABLE KEYS */;
INSERT INTO `login_entry` VALUES ('gourav','2019-08-06 02:10:48',NULL),('gourav','2019-08-06 02:12:31',NULL),('gourav','2019-08-06 02:12:35',NULL),('gourav','2019-08-06 10:06:47',NULL),('gourav','2019-08-06 10:27:03',NULL),('gourav','2019-08-06 10:53:08',NULL),('gourav','2019-08-06 23:01:30',NULL),('gourav','2019-09-09 20:32:14',NULL),('gourav','2019-09-09 20:33:59',NULL),('gourav','2019-09-09 20:45:01',NULL),('gourav','2019-09-10 13:29:18',NULL),('gourav','2019-09-10 13:33:53',NULL),('gourav','2019-09-10 15:36:47',NULL),('gourav','2019-09-10 15:37:40',NULL),('gourav','2019-09-14 14:31:23',NULL),('gourav','2019-09-16 12:19:02',NULL),('gourav','2019-09-19 21:35:33',NULL),('gourav','2019-12-15 17:18:56',NULL),('gourav','2019-12-15 17:22:46',NULL),('gourav','2019-12-15 17:37:37',NULL),('gourav','2019-12-15 17:39:40',NULL),('gourav','2019-12-15 18:00:51',NULL),('gourav','2019-12-15 18:02:09',NULL),('gourav','2019-12-15 18:10:12',NULL);
/*!40000 ALTER TABLE `login_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menu_repo`
--

DROP TABLE IF EXISTS `menu_repo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menu_repo` (
  `menuId` int(11) NOT NULL AUTO_INCREMENT,
  `menuItem` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `menuPrice` decimal(10,0) NOT NULL,
  `menuCode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`menuId`),
  KEY `menuItem` (`menuItem`),
  KEY `menuCodeIndex` (`menuCode`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menu_repo`
--

LOCK TABLES `menu_repo` WRITE;
/*!40000 ALTER TABLE `menu_repo` DISABLE KEYS */;
INSERT INTO `menu_repo` VALUES (1,'Paneer',100,'102'),(2,'Chicken',200,'103'),(3,'Chowmein',88,'104');
/*!40000 ALTER TABLE `menu_repo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promo_repo`
--

DROP TABLE IF EXISTS `promo_repo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promo_repo` (
  `promoId` int(11) NOT NULL AUTO_INCREMENT,
  `promoCode` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `promoCounter` int(11) NOT NULL,
  `entryUser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `promoEntryDate` datetime NOT NULL,
  `promoDiscountPercent` int(11) NOT NULL,
  PRIMARY KEY (`promoId`),
  UNIQUE KEY `promoCode_UNIQUE` (`promoCode`),
  UNIQUE KEY `promoId_UNIQUE` (`promoId`),
  KEY `fk_user_promo_idx` (`entryUser`),
  CONSTRAINT `fk_user_promo` FOREIGN KEY (`entryUser`) REFERENCES `user_repo` (`userId`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promo_repo`
--

LOCK TABLES `promo_repo` WRITE;
/*!40000 ALTER TABLE `promo_repo` DISABLE KEYS */;
INSERT INTO `promo_repo` VALUES (1,'TEST10',83,'gourav','2019-08-10 15:50:13',10);
/*!40000 ALTER TABLE `promo_repo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `raw_inventory_entry`
--

DROP TABLE IF EXISTS `raw_inventory_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `raw_inventory_entry` (
  `inventoryEntryId` int(11) NOT NULL AUTO_INCREMENT,
  `inventoryName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `inventoryPrice` int(11) NOT NULL,
  `dateOfPurchase` date NOT NULL,
  `updateTS` datetime NOT NULL,
  `weightInKgs` decimal(10,0) NOT NULL,
  `inventoryCode` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `entryUser` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`inventoryEntryId`),
  UNIQUE KEY `inventoryName_UNIQUE` (`inventoryName`),
  UNIQUE KEY `inventoryCode_UNIQUE` (`inventoryCode`),
  KEY `inventoryName` (`inventoryName`) /*!80000 INVISIBLE */,
  KEY `fkEntryUser_idx` (`entryUser`),
  CONSTRAINT `fkEntryUser` FOREIGN KEY (`entryUser`) REFERENCES `user_repo` (`userId`) ON UPDATE CASCADE,
  CONSTRAINT `inventoryCode` FOREIGN KEY (`inventoryCode`) REFERENCES `inventory_repo` (`inventoryCode`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `inventoryNameLink` FOREIGN KEY (`inventoryName`) REFERENCES `inventory_repo` (`inventoryName`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `raw_inventory_entry`
--

LOCK TABLES `raw_inventory_entry` WRITE;
/*!40000 ALTER TABLE `raw_inventory_entry` DISABLE KEYS */;
/*!40000 ALTER TABLE `raw_inventory_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_repo`
--

DROP TABLE IF EXISTS `user_repo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_repo` (
  `userId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `typeOfUser` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`userId`),
  UNIQUE KEY `userId_UNIQUE` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_repo`
--

LOCK TABLES `user_repo` WRITE;
/*!40000 ALTER TABLE `user_repo` DISABLE KEYS */;
INSERT INTO `user_repo` VALUES ('gourav','test','admin');
/*!40000 ALTER TABLE `user_repo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'inventorymanagement'
--
/*!50003 DROP PROCEDURE IF EXISTS `applyPromoCode` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `applyPromoCode`($promoCode varchar(45), $billEntryId int)
BEGIN
	declare $newPromoCounter int;
	declare $oldPromoCode varchar(45);
    if $promoCode = '' then 
		select promoCode into $oldPromoCode from bill_repo where  billEntryId = $billEntryId;
		 update bill_repo set promoCode = null where billEntryId = $billEntryId;
        if $oldPromoCode is not null then
			select promoCounter + 1 into $newPromoCounter from promo_repo where promoCode = $oldPromoCode;
            select $newPromoCounter;
			update promo_repo set promoCounter = $newPromoCounter where promoCode = $oldPromoCode;
        end if;
		select true as result;
	else
		select promoCounter - 1 into $newPromoCounter from promo_repo where promoCode = $promoCode;
		IF $newPromoCounter >= 0 THEN
			update promo_repo set promoCounter = $newPromoCounter where promoCode = $promoCode;
			update bill_repo set promoCode = $promoCode where billEntryId = $billEntryId;
			select true as result;
		ELSE 
			select false as result;
		END IF;
    end if;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `billTotalForBillEntryId` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `billTotalForBillEntryId`($billEntryId int)
BEGIN
	declare $total decimal(10);
    declare $discountPercent int;
    declare $promocode varchar(45);
	select SUM(mr.menuPrice*be.quantity) into $total from bill_entry as be
            join menu_repo as mr on mr.menuItem = be.menuItem
            where be.billEntryId = $billEntryId;
	if $total > 1 then
		select promoCode into $promocode from bill_repo where billEntryId = $billEntryId;
		if promoCode is not null then
			select promoDiscountPercent into $discountPercent from promo_repo where promoCode = $promocode;
			set $total = $total - $total * $discountPercent / 100;
		end if;
		-- apply sgst and cgst
		set $total = $total + 0.05 * $total;
    end if;
	select $total as total;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-12-30 21:15:53
