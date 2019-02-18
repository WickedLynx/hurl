'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
	return db.runSql('\
	CREATE TABLE IF NOT EXISTS `files` ( \
		`id` int(11) NOT NULL AUTO_INCREMENT, \
		`name` varchar(100) NOT NULL, \
		`size` bigint(20) unsigned NOT NULL, \
		`date_created` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), \
		`user_id` int(11) NOT NULL, \
		`path` varchar(150) NOT NULL, \
		PRIMARY KEY (`id`) \
	) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4; \
	\
	CREATE TABLE IF NOT EXISTS `tokens` ( \
		`id` int(11) NOT NULL AUTO_INCREMENT, \
		`file_id` int(11) NOT NULL, \
		`type` varchar(50) NOT NULL, \
		`value` varchar(100) NOT NULL, \
		`date_created` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), \
		`date_expires` datetime DEFAULT NULL, \
		`notes` varchar(150) DEFAULT NULL, \
		`password` varchar(300) DEFAULT NULL, \
		PRIMARY KEY (`id`) \
	) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4; \
	\
	CREATE TABLE IF NOT EXISTS `users` ( \
		`id` int(11) NOT NULL AUTO_INCREMENT, \
		`email` varchar(50) NOT NULL, \
		`password` varchar(100) NOT NULL, \
		`date_created` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(), \
		PRIMARY KEY (`id`) \
	) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4; \
	');
};

exports.down = function(db) {
	return db.runSql('\
		DROP TABLE IF EXISTS `users`;\
		DROP TABLE IF EXISTS `files`;\
		DROP TABLE IF EXISTS `tokens`;\
	');
};

exports._meta = {
  "version": 1
};
