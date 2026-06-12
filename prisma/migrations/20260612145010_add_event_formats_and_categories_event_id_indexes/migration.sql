-- CreateIndex
CREATE INDEX "event_categories_eventId_order_idx" ON "event_categories"("eventId", "order");

-- CreateIndex
CREATE INDEX "event_formats_eventId_order_idx" ON "event_formats"("eventId", "order");
