-- ==============================================================
-- Rishikar Sports E-Commerce Database Schema
-- cPanel MySQL / phpMyAdmin Compatible
-- ==============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Products Table
CREATE TABLE IF NOT EXISTS `rs_products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `data` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_slug` (`slug`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS `rs_orders` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `order_number` VARCHAR(50) DEFAULT NULL,
  `customer_name` VARCHAR(255) DEFAULT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `total` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_order_number` (`order_number`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Enquiries Table
CREATE TABLE IF NOT EXISTS `rs_enquiries` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'New',
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Coupons Table
CREATE TABLE IF NOT EXISTS `rs_coupons` (
  `code` VARCHAR(50) NOT NULL PRIMARY KEY,
  `discount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `type` VARCHAR(20) DEFAULT 'percent',
  `data` LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Store Settings Table
CREATE TABLE IF NOT EXISTS `rs_settings` (
  `setting_key` VARCHAR(100) NOT NULL PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Users Table
CREATE TABLE IF NOT EXISTS `rs_users` (
  `id` VARCHAR(100) NOT NULL PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `phone` VARCHAR(50) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Rate List Table
CREATE TABLE IF NOT EXISTS `rs_rate_list` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `data` LONGTEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
