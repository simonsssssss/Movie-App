/*
  Warnings:

  - You are about to drop the column `trailerUrl` on the `Movie` table. All the data in the column will be lost.
  - Added the required column `trailerEmbedUrl` to the `Movie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "trailerUrl",
ADD COLUMN     "trailerEmbedUrl" TEXT NOT NULL;
