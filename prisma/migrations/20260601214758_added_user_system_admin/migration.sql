-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passHash" TEXT NOT NULL,
    "systemAdmin" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("name", "passHash", "username", "uuid") SELECT "name", "passHash", "username", "uuid" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_passHash_key" ON "User"("passHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
