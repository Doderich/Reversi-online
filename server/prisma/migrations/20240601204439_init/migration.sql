/*
  Warnings:

  - You are about to drop the column `gameId` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting'
);
INSERT INTO "new_User" ("id", "status", "user_id") SELECT "id", "status", "user_id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");
PRAGMA foreign_key_check("User");
PRAGMA foreign_keys=ON;
