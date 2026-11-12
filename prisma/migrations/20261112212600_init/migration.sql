CREATE TABLE "shareo_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shareo_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "shareo_files" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "original_name" TEXT NOT NULL,
    "stored_name" TEXT NOT NULL,
    "password" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shareo_files_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shareo_users_email_key" ON "shareo_users"("email");
CREATE UNIQUE INDEX "shareo_files_stored_name_key" ON "shareo_files"("stored_name");
CREATE INDEX "shareo_files_user_id_created_at_idx" ON "shareo_files"("user_id", "created_at");
CREATE INDEX "shareo_files_expires_at_idx" ON "shareo_files"("expires_at");

ALTER TABLE "shareo_files"
ADD CONSTRAINT "shareo_files_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "shareo_users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
