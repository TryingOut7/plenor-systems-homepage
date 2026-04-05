-- Drop the redundant changed_at column from audit_logs.
-- This column was added by Payload schema-push but duplicates the built-in
-- created_at timestamp that Payload already writes on every insert.
-- The AuditLogs collection no longer declares it, and the auditLog.ts hook
-- no longer sets it.

ALTER TABLE audit_logs DROP COLUMN IF EXISTS changed_at;
