DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR (100) NOT NULL,
  department_name VARCHAR (50) NOT NULL,
  price DECIMAL (20,2) NOT NULL DEFAULT 0,
  stock_quantity INT NOT NULL DEFAULT 0,
  product_sales DECIMAL (20,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (item_id)
);

CREATE TABLE departments (
  department_id INT NOT NULL AUTO_INCREMENT,
  department_name VARCHAR (50) NOT NULL,
  over_head_costs DECIMAL (20,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (department_id)
);

INSERT INTO
departments (department_name, over_head_costs) 
VALUES 
('Home & Garden', 543),
('Toys', 102),
('Apparel & Accessories', 352),
('Books', 213),
('Movies & TV', 12),
('Pets', 2);

-- to prepend the dollar sign to price:
-- USE bamazon_db;

-- SELECT price, concat('$', format(sum(price), 2))
-- FROM products
-- GROUP BY 1;