/*
  Warnings:

  - You are about to drop the column `userId` on the `Game` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "board" TEXT NOT NULL
);
INSERT INTO "new_Game" ("board", "id", "status") SELECT "board", "id", "status" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "gameId" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "User_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("id", "status") SELECT "id", "status" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");
PRAGMA foreign_key_check("Game");
PRAGMA foreign_key_check("User");
PRAGMA foreign_keys=ON;
