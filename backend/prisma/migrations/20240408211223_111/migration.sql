/*
  Warnings:

  - You are about to drop the column `description` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `dislikes` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `topCast` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Movie` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Movie" DROP CONSTRAINT "Movie_userId_fkey";

-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "description",
DROP COLUMN "dislikes",
DROP COLUMN "likes",
DROP COLUMN "topCast",
DROP COLUMN "userId";
