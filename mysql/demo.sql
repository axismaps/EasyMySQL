/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50171
Source Host           : localhost:3306
Source Database       : demo

Target Server Type    : MYSQL
Target Server Version : 50171
File Encoding         : 65001

Date: 2014-08-07 01:37:11
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `country`
-- ----------------------------
DROP TABLE IF EXISTS `country`;
CREATE TABLE `country` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of country
-- ----------------------------
INSERT INTO `country` VALUES ('1', 'USA');
INSERT INTO `country` VALUES ('2', 'UK');
INSERT INTO `country` VALUES ('3', 'Spain');
INSERT INTO `country` VALUES ('4', 'China');

-- ----------------------------
-- Table structure for `typetest`
-- ----------------------------
DROP TABLE IF EXISTS `typetest`;
CREATE TABLE `typetest` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Short_text` varchar(500) DEFAULT 'lllll',
  `Long_text` longtext,
  `Number` int(11) DEFAULT NULL,
  `Categories` varchar(500) DEFAULT NULL,
  `Date` date DEFAULT '2014-01-01',
  `URL` varchar(500) DEFAULT NULL,
  `Image` varchar(500) DEFAULT NULL,
  `Nationality` varchar(50) DEFAULT NULL,
  `Years` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of typetest
-- ----------------------------
INSERT INTO `typetest` VALUES ('1', 'lllll', null, null, '90', null, null, null, null, null);
INSERT INTO `typetest` VALUES ('88', 'm', 'TT', '2', '5', '2014-09-06', 'http://qqkk.com', 'http://qqkk.com', 'USA', '1985');
INSERT INTO `typetest` VALUES ('89', 't', 'k', '0', '5', '2014-07-23', 'http://qqkk.com', 'http://aa.com', 'UK', '1985,1986');
INSERT INTO `typetest` VALUES ('99', '0', '0', '1', '0', '2014-07-03', 'http://qqkk.com', 'http://AA.COM', 'UK', '1985');
INSERT INTO `typetest` VALUES ('101', '0', 't', '5', '5', '2014-06-01', 'http://www.a.com', 'D:\\semaster3\\project1\\tmp\\2984-1kr8n9j.jpg', 'USA', 'NULL');
INSERT INTO `typetest` VALUES ('103', '0', 'tt', '1', '0', '2011-01-01', null, 'D:\\semaster3\\project1\\tmp\\2984-m3g1rq.jpg', 'USA', null);
INSERT INTO `typetest` VALUES ('104', '0', '0', '1', '0', '2014-07-12', null, 'D:\\semaster3\\project1\\tmp\\5800-73n4u9.jpg', 'USA', null);
INSERT INTO `typetest` VALUES ('105', 'short', '0', '77', '0', '2014-07-10', null, 'D:\\semaster3\\project1\\tmp\\8536-1bn0284.jpg', 'USA', null);
INSERT INTO `typetest` VALUES ('108', 'short', '0', '77', '0', '2014-07-03', null, null, 'USA', null);
INSERT INTO `typetest` VALUES ('110', 'short', '0', '0', '0', '2014-07-10', null, null, 'USA', null);
INSERT INTO `typetest` VALUES ('113', 'mm', 'long text', null, '0', '2014-01-01', null, null, 'USA', null);
INSERT INTO `typetest` VALUES ('115', 'lllll', 'long text', '0', null, '2014-01-01', null, null, 'Spain', null);
INSERT INTO `typetest` VALUES ('116', 'lllll', 'long text', '0', null, '2014-01-01', null, null, 'Spain', null);
INSERT INTO `typetest` VALUES ('122', 'lllll', 'long text', '1', null, '2014-01-01', null, 'D:\\semaster3\\project1\\tmp\\7700-1opvdwp.png', 'Spain', null);
INSERT INTO `typetest` VALUES ('123', 'lllll', 'long text', null, null, '2014-01-01', null, null, 'Spain', null);
INSERT INTO `typetest` VALUES ('124', 'ss', 'long', null, null, '2014-01-04', null, null, null, null);

-- ----------------------------
-- Table structure for `year`
-- ----------------------------
DROP TABLE IF EXISTS `year`;
CREATE TABLE `year` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of year
-- ----------------------------
INSERT INTO `year` VALUES ('1', '1985');
INSERT INTO `year` VALUES ('2', '1986');
INSERT INTO `year` VALUES ('3', '1987');
