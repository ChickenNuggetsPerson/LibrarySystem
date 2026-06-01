-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "libraryuuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isbn" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pageCount" TEXT NOT NULL,
    "imageUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "imageLink" TEXT NOT NULL,
    CONSTRAINT "Book_libraryuuid_fkey" FOREIGN KEY ("libraryuuid") REFERENCES "Library" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("author", "description", "imageLink", "isbn", "libraryuuid", "pageCount", "title", "uuid") SELECT "author", "description", "imageLink", "isbn", "libraryuuid", "pageCount", "title", "uuid" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
