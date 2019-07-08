DROP DATABASE IF EXISTS bamazon_DB;
CREATE DATABASE bamazon_DB;

USE bamazon_DB;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR (100) NOT NULL,
  department_name VARCHAR (50) NOT NULL,
  price DECIMAL (5,2) NOT NULL,
  stock_quantity INT NOT NULL,
  PRIMARY KEY (item_id)
);


-- to prepend the dollar sign to price:
-- USE bamazon_db;

-- SELECT price, concat('$', format(sum(price), 2))
-- FROM products
-- GROUP BY 1;