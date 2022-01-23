/*
  Warnings:

  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `User_username_password_key` ON `User`;

-- DropIndex
DROP INDEX `User_username_password_token_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `username`;
