-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "galleryImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "heroImageUrl" TEXT;
