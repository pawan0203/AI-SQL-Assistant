-- Sample schema + data for local development and demoing the assistant.
-- Runs automatically on first container start (docker-entrypoint-initdb.d).

CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  country TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  ordered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO customers (name, email, country) VALUES
  ('Ava Patel', 'ava.patel@example.com', 'India'),
  ('Liam Chen', 'liam.chen@example.com', 'Singapore'),
  ('Sofia Rossi', 'sofia.rossi@example.com', 'Italy'),
  ('Noah Kim', 'noah.kim@example.com', 'South Korea'),
  ('Emma Garcia', 'emma.garcia@example.com', 'Spain');

INSERT INTO products (name, category, price) VALUES
  ('Wireless Mouse', 'Electronics', 24.99),
  ('Mechanical Keyboard', 'Electronics', 89.50),
  ('Standing Desk', 'Furniture', 349.00),
  ('Desk Lamp', 'Furniture', 39.99),
  ('Noise-Cancelling Headphones', 'Electronics', 199.00);

INSERT INTO orders (customer_id, product_id, quantity, status, ordered_at) VALUES
  (1, 2, 1, 'delivered', now() - interval '10 days'),
  (1, 5, 1, 'delivered', now() - interval '3 days'),
  (2, 1, 2, 'shipped', now() - interval '5 days'),
  (3, 3, 1, 'pending', now() - interval '1 days'),
  (4, 4, 3, 'delivered', now() - interval '20 days'),
  (5, 2, 1, 'cancelled', now() - interval '7 days'),
  (2, 5, 1, 'delivered', now() - interval '15 days'),
  (3, 1, 4, 'delivered', now() - interval '2 days');
