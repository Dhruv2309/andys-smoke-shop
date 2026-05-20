-- Run this once against your PostgreSQL database to set up the schema.
-- Example: psql $DATABASE_URL -f schema.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT          UNIQUE NOT NULL,
  password_hash TEXT          NOT NULL,
  first_name    TEXT          NOT NULL,
  last_name     TEXT          NOT NULL,
  date_of_birth DATE          NOT NULL,
  age_verified  BOOLEAN       DEFAULT FALSE,
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     TEXT        NOT NULL DEFAULT 'active',  -- active | checked_out | abandoned
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id    UUID        NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT        NOT NULL,
  quantity   INTEGER     NOT NULL DEFAULT 1,
  added_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id                TEXT          PRIMARY KEY,
  user_id           UUID          NOT NULL REFERENCES users(id),
  cart_id           UUID          REFERENCES carts(id),
  status            TEXT          NOT NULL DEFAULT 'pending',  -- pending | paid | cancelled
  total             NUMERIC(10,2) NOT NULL,
  stripe_session_id TEXT,
  created_at        TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE TABLE IF NOT EXISTS payment_methods (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT        UNIQUE NOT NULL,
  type                     TEXT        NOT NULL DEFAULT 'card',
  brand                    TEXT,
  last4                    TEXT,
  exp_month                INTEGER,
  exp_year                 INTEGER,
  is_default               BOOLEAN     DEFAULT FALSE,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS age_verifications (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id TEXT        UNIQUE NOT NULL,
  status            TEXT        NOT NULL DEFAULT 'pending',  -- pending | verified | failed
  verified_dob      DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up active carts per user quickly
CREATE INDEX IF NOT EXISTS idx_carts_user_status ON carts(user_id, status);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS products (
  sku           TEXT          PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  brand         VARCHAR(100),
  category      VARCHAR(100)  NOT NULL,
  subcategory   VARCHAR(100),
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL,
  cost_price    NUMERIC(10,2),
  stock         INTEGER       NOT NULL DEFAULT 0,
  min_stock     INTEGER       NOT NULL DEFAULT 5,
  is_active     BOOLEAN       DEFAULT TRUE,
  age_restricted BOOLEAN      DEFAULT TRUE,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
