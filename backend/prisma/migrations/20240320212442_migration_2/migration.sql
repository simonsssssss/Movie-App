/*
  Warnings:

  - You are about to drop the column `top_cast` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Movie` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Movie" DROP COLUMN "top_cast",
DROP COLUMN "user_id",
ADD COLUMN     "topCast" TEXT[];
