-- =============================================================================
-- Migration: Remove Credits Expiry Feature
-- =============================================================================
-- Description: Credits are now permanent and never expire
--              Remove all expiry-related columns from the database
-- Date: 2026-01-20
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Drop credits_expires_at column from users table
-- -----------------------------------------------------------------------------
ALTER TABLE public.users
DROP COLUMN IF EXISTS credits_expires_at;

-- -----------------------------------------------------------------------------
-- 2. Drop validity_days column from redemption_codes table
-- -----------------------------------------------------------------------------
-- First drop the constraint
ALTER TABLE public.redemption_codes
DROP CONSTRAINT IF EXISTS valid_validity_days;

-- Then drop the column
ALTER TABLE public.redemption_codes
DROP COLUMN IF EXISTS validity_days;

-- -----------------------------------------------------------------------------
-- 3. Drop credits_validity_days column from payments table
-- -----------------------------------------------------------------------------
ALTER TABLE public.payments
DROP COLUMN IF EXISTS credits_validity_days;

-- =============================================================================
-- Summary:
-- - Removed: users.credits_expires_at
-- - Removed: redemption_codes.validity_days
-- - Removed: payments.credits_validity_days
-- - All credits are now permanent and never expire
-- =============================================================================
