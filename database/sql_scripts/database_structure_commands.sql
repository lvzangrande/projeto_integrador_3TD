CREATE DATABASE IF NOT EXISTS DB_water_control CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE DB_water_control;

CREATE USER 'water_control_database_manager'@'localhost';

GRANT SELECT,CREATE,INSERT,UPDATE,DELETE ON DB_water_control.* TO 'water_control_database_manager'@'localhost';
