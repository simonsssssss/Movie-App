/*
  Warnings:

  - Added the required column `description` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseYear` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "countries" TEXT[],
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "directors" TEXT[],
ADD COLUMN     "releaseYear" INTEGER NOT NULL,
ADD COLUMN     "topCast" TEXT[];
