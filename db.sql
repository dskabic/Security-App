CREATE TABLE korisnik (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  password TEXT NOT NULL
  );

INSERT INTO korisnik (username, password) VALUES
('admin','1234'),
('alice','0000'),
('bob','4321');

CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
INSERT INTO products (name, price) VALUES
('Coffee Mug', 9.9),
('T-shirt', 19.99),
('Notebook', 4.50);