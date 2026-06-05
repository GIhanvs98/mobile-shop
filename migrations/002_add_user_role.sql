-- Migration 002 — Add role column to "user" table
-- The user table was bootstrapped by better-auth before the full schema
-- migration ran, so the role column needs to be added separately.

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';
