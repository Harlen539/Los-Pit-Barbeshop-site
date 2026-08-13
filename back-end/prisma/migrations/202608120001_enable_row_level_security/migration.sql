-- The application accesses the database only through the authenticated Node API.
-- Enabling RLS without public policies prevents accidental access through the
-- Supabase Data API (anon/authenticated keys). The database owner used by the
-- Prisma backend and migrations continues to have access.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "RefreshToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Professional" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Service" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProfessionalService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProfessionalSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ProfessionalBreak" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BlockedPeriod" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Appointment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AppointmentService" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GalleryImage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BusinessSetting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
