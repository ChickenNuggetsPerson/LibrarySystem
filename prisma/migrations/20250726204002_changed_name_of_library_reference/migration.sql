/*
  Warnings:

  - You are about to drop the column `Libraryuuid` on the `Category` table. All the data in the column will be lost.
  - Added the required column `libraryUUID` to the `Category` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "libraryUUID" TEXT NOT NULL,
    CONSTRAINT "Category_libraryUUID_fkey" FOREIGN KEY ("libraryUUID") REFERENCES "Library" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Category" ("color", "name", "uuid") SELECT "color", "name", "uuid" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
