/*
  Warnings:

  - Added the required column `data` to the `WebhookLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `webhooklog` ADD COLUMN `data` JSON NOT NULL;
