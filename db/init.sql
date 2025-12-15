-- public.brands definition

-- Drop table

-- DROP TABLE brands;
SET search_path TO public;

CREATE TABLE brands (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	"name" varchar(100) NOT NULL,
	created_at timestamp DEFAULT now() NOT NULL,
	CONSTRAINT brand_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX brands_name_unique ON public.brands USING btree (lower((name)::text));


-- public.categories definition

-- Drop table

-- DROP TABLE categories;

CREATE TABLE categories (
	"name" varchar NULL,
	description varchar NULL,
	photo varchar NULL,
	createdat timestamp DEFAULT now() NOT NULL,
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	CONSTRAINT categories_pk PRIMARY KEY (id)
);
CREATE UNIQUE INDEX categories_name_unique ON public.categories USING btree (lower((name)::text));


-- public.discount definition

-- Drop table

-- DROP TABLE discount;

CREATE TABLE discount (
	id serial4 NOT NULL,
	"percent" numeric(5, 2) NOT NULL,
	promotion varchar(100) NULL,
	start_date date NULL,
	end_date date NULL,
	CONSTRAINT discount_pkey PRIMARY KEY (id)
);


-- public.users definition

-- Drop table

-- DROP TABLE users;

CREATE TABLE IF NOT EXISTS users (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	username varchar(50) NOT NULL,
	"password" text NOT NULL,
	email varchar(100) NOT NULL,
	phone varchar NOT NULL,
	"role" int4 NULL,
	is_verified bool DEFAULT false NULL,
	email_otp_hash text NULL,
	email_otp_expires timestamp NULL,
	CONSTRAINT uq_users_email UNIQUE (email),
	CONSTRAINT uq_users_username UNIQUE (username),
	CONSTRAINT users_pk PRIMARY KEY (id)
);


-- public.warehouses definition

-- Drop table

-- DROP TABLE warehouses;

CREATE TABLE warehouses (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	"location" varchar(255) NULL,
	"name" varchar NULL,
	created_at timestamp NULL,
	updated_at timestamp NULL,
	CONSTRAINT warehouse_pkey PRIMARY KEY (id)
);


-- public."attributes" definition

-- Drop table

-- DROP TABLE "attributes";

CREATE TABLE "attributes" (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	"name" varchar NOT NULL,
	category_id int4 NULL,
	CONSTRAINT attributes_pk PRIMARY KEY (id),
	CONSTRAINT fk_category_attribute FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);


-- public.payments definition

-- Drop table

-- DROP TABLE payments;

CREATE TABLE payments (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	user_id int4 NOT NULL,
	amount numeric(10, 2) NOT NULL,
	status varchar(50) DEFAULT 'pending'::character varying NULL,
	"method" varchar(50) DEFAULT 'card'::character varying NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp NULL,
	CONSTRAINT payment_pkey PRIMARY KEY (id),
	CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT payment_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX idx_payment_user_id ON public.payments USING btree (user_id);


-- public.products definition

-- Drop table

-- DROP TABLE products;

CREATE TABLE products (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	brand_id int4 NOT NULL,
	brand_name varchar NULL,
	category_name varchar NULL,
	category_id int4 NOT NULL,
	"name" varchar NULL,
	quantity int4 NULL,
	"type" varchar NULL,
	price numeric NULL,
	status varchar NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	discount_id int4 NULL,
	"size" varchar NULL,
	updated_at timestamp NULL,
	CONSTRAINT products_pk PRIMARY KEY (id),
	CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
	CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
	CONSTRAINT fk_products_discount FOREIGN KEY (discount_id) REFERENCES discount(id) ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX idx_products_brand_id ON public.products USING btree (brand_id);
CREATE INDEX idx_products_category_id ON public.products USING btree (category_id);
CREATE INDEX idx_products_discount_id ON public.products USING btree (discount_id);


-- public.warehouse_stock definition

-- Drop table

-- DROP TABLE warehouse_stock;

CREATE TABLE warehouse_stock (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	product_id int4 NULL,
	warehouse_id int4 NULL,
	quantity int4 DEFAULT 0 NOT NULL,
	CONSTRAINT warehouse_stock_pkey PRIMARY KEY (id),
	CONSTRAINT warehouse_stock_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
	CONSTRAINT warehouse_stock_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);


-- public.attribute_values definition

-- Drop table

-- DROP TABLE attribute_values;

CREATE TABLE attribute_values (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	attribute_id int4 NOT NULL,
	value varchar NOT NULL,
	CONSTRAINT attribute_values_pk PRIMARY KEY (id),
	CONSTRAINT fk_attribute_values_attribute FOREIGN KEY (attribute_id) REFERENCES "attributes"(id) ON DELETE CASCADE
);


-- public.cart definition

-- Drop table

-- DROP TABLE cart;

CREATE TABLE cart (
	user_id int4 NOT NULL,
	product_id int4 NOT NULL,
	quantity int4 DEFAULT 1 NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	price numeric(10, 2) NULL,
	warehouse_id int4 NOT NULL,
	CONSTRAINT cart_pk PRIMARY KEY (id),
	CONSTRAINT cart_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
	CONSTRAINT cart_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
	CONSTRAINT cart_warehouse_fk FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE RESTRICT,
	CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX cart_unique_user_product_warehouse ON public.cart USING btree (user_id, product_id, warehouse_id);
CREATE INDEX idx_cart_product_id ON public.cart USING btree (product_id);
CREATE INDEX idx_cart_user_id ON public.cart USING btree (user_id);


-- public.orders definition

-- Drop table

-- DROP TABLE orders;

CREATE TABLE orders (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	user_id int4 NOT NULL,
	status varchar(50) DEFAULT 'processing'::character varying NULL,
	total_amount numeric(10, 2) NULL,
	shipping_address varchar(255) NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	payment_id int4 NULL,
	CONSTRAINT orders_pkey PRIMARY KEY (id),
	CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT orders_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id),
	CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);


-- public.product_attributes definition

-- Drop table

-- DROP TABLE product_attributes;

CREATE TABLE product_attributes (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	product_id int4 NULL,
	attribute_id int4 NULL,
	attribute_value_id int4 NULL,
	CONSTRAINT product_attributes_pk PRIMARY KEY (id),
	CONSTRAINT fk_product_attributes_attribute FOREIGN KEY (attribute_id) REFERENCES "attributes"(id) ON DELETE CASCADE,
	CONSTRAINT fk_product_attributes_attribute_value FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE,
	CONSTRAINT fk_product_attributes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


-- public.order_items definition

-- Drop table

-- DROP TABLE order_items;

CREATE TABLE order_items (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	order_id int4 NOT NULL,
	product_id int4 NOT NULL,
	quantity int4 DEFAULT 1 NULL,
	price numeric(10, 2) NOT NULL,
	CONSTRAINT order_items_pkey PRIMARY KEY (id),
	CONSTRAINT order_items_quantity_check CHECK ((quantity > 0)),
	CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
	CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);


-- public.order_payment definition

-- Drop table

-- DROP TABLE order_payment;

CREATE TABLE order_payment (
	id int4 GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE) NOT NULL,
	order_id int4 NULL,
	payment_id int4 NULL,
	created_at timestamp NULL,
	CONSTRAINT order_payment_pkey PRIMARY KEY (id),
	CONSTRAINT order_payment_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
	CONSTRAINT order_payment_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

UPDATE users
SET role = 30,       -- admin role
    is_verified = true -- ensure admin bypasses email verification
WHERE email = 'nominzulamartuvshin@gmail.com';

