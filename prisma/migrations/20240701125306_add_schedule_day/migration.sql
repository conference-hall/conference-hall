-- CreateTable
CREATE TABLE "schedule_days" (
    "id" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "schedule_days_scheduleId_day_key" ON "schedule_days"("scheduleId", "day");

-- AddForeignKey
ALTER TABLE "schedule_days" ADD CONSTRAINT "schedule_days_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
