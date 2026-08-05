-- 001_init.sql — initial schema for the Peaffee store
-- Money is stored as INTEGER cents to avoid floating-point errors.

CREATE TABLE IF NOT EXISTS users (
  id                     BIGSERIAL PRIMARY KEY,
  email                  TEXT UNIQUE NOT NULL,
  password_hash          TEXT NOT NULL,
  full_name              TEXT NOT NULL DEFAULT '',
  role                   TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  reset_token            TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- connect-pg-simple session store table
CREATE TABLE IF NOT EXISTS session (
  sid    VARCHAR NOT NULL PRIMARY KEY,
  sess   JSON NOT NULL,
  expire TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_session_expire ON session (expire);

CREATE TABLE IF NOT EXISTS products (
  id                BIGSERIAL PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,
  title_en          TEXT NOT NULL,
  title_cn          TEXT NOT NULL,
  category          TEXT NOT NULL,                        -- face | body | protection
  category_en       TEXT NOT NULL,                        -- display copy
  category_cn       TEXT NOT NULL,
  desc_en           TEXT NOT NULL,                        -- rich modal/quick-view copy
  desc_cn           TEXT NOT NULL,
  grid_desc_en      TEXT,                                 -- short shop-grid copy (nullable → falls back to desc_en)
  grid_desc_cn      TEXT,
  tag_en            TEXT NOT NULL,
  tag_cn            TEXT NOT NULL,
  active_en         TEXT NOT NULL,                        -- key ingredients
  active_cn         TEXT NOT NULL,
  skin_en           TEXT NOT NULL,                        -- best for
  skin_cn           TEXT NOT NULL,
  usage_en          TEXT NOT NULL,                        -- how to use
  usage_cn          TEXT NOT NULL,
  moq_en            TEXT NOT NULL DEFAULT 'Daily ritual',
  moq_cn            TEXT NOT NULL DEFAULT '日常护理',
  ritual_categories TEXT NOT NULL DEFAULT '',             -- space-separated: "hydrate repair"
  ritual_desc_en    TEXT NOT NULL DEFAULT '',             -- index.html card copy
  ritual_desc_cn    TEXT NOT NULL DEFAULT '',
  ritual_tag_en     TEXT NOT NULL DEFAULT '',
  ritual_tag_cn     TEXT NOT NULL DEFAULT '',
  price_cents       INTEGER NOT NULL CHECK (price_cents >= 0),
  stock             INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url         TEXT NOT NULL,                        -- site-relative: /assets/hero.webp
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  featured          BOOLEAN NOT NULL DEFAULT false,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_status_sort ON products (status, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products (category);

CREATE TABLE IF NOT EXISTS orders (
  id                   BIGSERIAL PRIMARY KEY,
  order_no             TEXT UNIQUE NOT NULL,              -- human-facing: PF-…
  user_id              BIGINT REFERENCES users(id) ON DELETE SET NULL,  -- nullable = guest checkout
  customer_name        TEXT NOT NULL,
  customer_email       TEXT NOT NULL,
  country              TEXT NOT NULL,
  shipping_address     TEXT NOT NULL,
  payment_method       TEXT NOT NULL CHECK (payment_method IN ('paypal', 'western_union')),
  payment_status       TEXT NOT NULL DEFAULT 'pending'
                         CHECK (payment_status IN ('pending', 'awaiting_confirmation', 'paid', 'refunded', 'cancelled')),
  order_status         TEXT NOT NULL DEFAULT 'pending'
                         CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'completed', 'cancelled')),
  paypal_order_id      TEXT,
  paypal_capture_id    TEXT UNIQUE,                       -- idempotency key
  wu_reference         TEXT,                              -- customer-entered WU MTCN/reference
  wu_receipt_path      TEXT,                              -- admin-only file path
  items_subtotal_cents INTEGER NOT NULL CHECK (items_subtotal_cents >= 0),
  shipping_cents       INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  total_cents          INTEGER NOT NULL CHECK (total_cents >= 0),
  currency             CHAR(3) NOT NULL DEFAULT 'USD',
  placed_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at              TIMESTAMPTZ,
  shipped_at           TIMESTAMPTZ,
  admin_notes          TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_email          ON orders (customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_user          ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders (payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_placed_at     ON orders (placed_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id               BIGSERIAL PRIMARY KEY,
  order_id         BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       BIGINT REFERENCES products(id) ON DELETE SET NULL,
  slug             TEXT NOT NULL,                        -- snapshot; product may be deleted later
  title_en         TEXT NOT NULL,
  title_cn         TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0),
  image_url        TEXT
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

CREATE TABLE IF NOT EXISTS inquiries (
  id         BIGSERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  interest   TEXT,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
