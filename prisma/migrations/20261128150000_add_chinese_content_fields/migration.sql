-- Simplified Chinese (/zh) content, mirroring the *En columns. All nullable:
-- untranslated rows fall back to English, then Vietnamese.
ALTER TABLE "ProductCategory" ADD COLUMN "nameZh" TEXT,
ADD COLUMN "descriptionZh" TEXT;

ALTER TABLE "Industry" ADD COLUMN "nameZh" TEXT,
ADD COLUMN "descriptionZh" TEXT;

ALTER TABLE "Product" ADD COLUMN "shortDescriptionZh" TEXT,
ADD COLUMN "descriptionZh" TEXT,
ADD COLUMN "useCasesZh" JSONB,
ADD COLUMN "applicationTagsZh" JSONB;

ALTER TABLE "ProductSpec" ADD COLUMN "labelZh" TEXT;

ALTER TABLE "SiteSettings" ADD COLUMN "statYearsLabelZh" TEXT,
ADD COLUMN "statVolumeLabelZh" TEXT,
ADD COLUMN "statQualityLabelZh" TEXT;
