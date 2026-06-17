-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "time_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Box" (
    "id" TEXT NOT NULL,
    "box_name" TEXT,
    "box_id_default" TEXT NOT NULL,

    CONSTRAINT "Box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Species" (
    "id" TEXT NOT NULL,
    "taxon_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "confidence_score" INTEGER NOT NULL,
    "kingdom" TEXT,
    "class" TEXT,
    "order" TEXT,
    "family" TEXT,
    "genus" TEXT,
    "species" TEXT,
    "observation_string" TEXT,
    "image_string" TEXT,
    "wikipedia_string" TEXT,
    "box_id" TEXT NOT NULL,

    CONSTRAINT "Species_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Box_box_id_default_key" ON "Box"("box_id_default");

-- AddForeignKey
ALTER TABLE "Species" ADD CONSTRAINT "Species_box_id_fkey" FOREIGN KEY ("box_id") REFERENCES "Box"("box_id_default") ON DELETE RESTRICT ON UPDATE CASCADE;
