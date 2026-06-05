-- ============================================================
-- Migration 001 — Initial Schema
-- Project: Anything Platform (Web)
-- ============================================================
-- Run order matters — tables with foreign keys come after their
-- referenced tables.
-- ============================================================


-- ------------------------------------------------------------
-- 1. better-auth tables (auth, sessions, accounts, verification)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "user" (
  id              TEXT        PRIMARY KEY,
  name            TEXT        NOT NULL,
  email           TEXT        NOT NULL UNIQUE,
  "emailVerified" BOOLEAN     NOT NULL DEFAULT FALSE,
  image           TEXT,
  role            TEXT        NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session (
  id              TEXT        PRIMARY KEY,
  "expiresAt"     TIMESTAMPTZ NOT NULL,
  token           TEXT        NOT NULL UNIQUE,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ipAddress"     TEXT,
  "userAgent"     TEXT,
  "userId"        TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id                      TEXT        PRIMARY KEY,
  "accountId"             TEXT        NOT NULL,
  "providerId"            TEXT        NOT NULL,
  "userId"                TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accessToken"           TEXT,
  "refreshToken"          TEXT,
  "idToken"               TEXT,
  "accessTokenExpiresAt"  TIMESTAMPTZ,
  "refreshTokenExpiresAt" TIMESTAMPTZ,
  scope                   TEXT,
  password                TEXT,
  "createdAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification (
  id          TEXT        PRIMARY KEY,
  identifier  TEXT        NOT NULL,
  value       TEXT        NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 2. categories
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL      PRIMARY KEY,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  status      TEXT        NOT NULL DEFAULT 'active',  -- 'active' | 'inactive'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 3. products
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS products (
  id              SERIAL        PRIMARY KEY,
  name            TEXT          NOT NULL,
  slug            TEXT          NOT NULL UNIQUE,
  brand           TEXT,
  sku             TEXT,
  category_id     INTEGER       NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price           NUMERIC(10,2) NOT NULL,
  discount_price  NUMERIC(10,2),
  stock           INTEGER       NOT NULL DEFAULT 0,
  description     TEXT,
  specifications  JSONB,           -- key/value product specs stored as JSON
  image_url       TEXT,
  status          TEXT          NOT NULL DEFAULT 'active',  -- 'active' | 'inactive' | 'draft'
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status    ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug      ON products(slug);


-- ------------------------------------------------------------
-- 4. product_images  (additional gallery images per product)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_images (
  id          SERIAL      PRIMARY KEY,
  product_id  INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url   TEXT        NOT NULL,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);


-- ------------------------------------------------------------
-- 5. orders
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL        PRIMARY KEY,
  user_id         TEXT          NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
  total_amount    NUMERIC(10,2) NOT NULL,
  status          TEXT          NOT NULL DEFAULT 'pending',
  -- status values: pending | confirmed | processing | shipped | delivered | cancelled
  payment_method  TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);


-- ------------------------------------------------------------
-- 6. order_items
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL        PRIMARY KEY,
  order_id    INTEGER       NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id  INTEGER       NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER       NOT NULL DEFAULT 1,
  unit_price  NUMERIC(10,2) NOT NULL,   -- price at time of purchase (snapshot)
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);


-- ------------------------------------------------------------
-- 7. reviews
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL      PRIMARY KEY,
  product_id  INTEGER     NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     TEXT        NOT NULL REFERENCES "user"(id)   ON DELETE CASCADE,
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)   -- one review per user per product
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user    ON reviews(user_id);
