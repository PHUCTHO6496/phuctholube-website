-- AlterTable
ALTER TABLE "Industry" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "applicationTagsEn" JSONB,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "shortDescriptionEn" TEXT,
ADD COLUMN     "useCasesEn" JSONB;

-- AlterTable
ALTER TABLE "ProductCategory" ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "ProductSpec" ADD COLUMN     "labelEn" TEXT;
