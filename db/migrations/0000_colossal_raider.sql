CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_slug` text NOT NULL,
	`product_name` text NOT NULL,
	`unit_price_ugx` integer NOT NULL,
	`quantity` integer NOT NULL,
	`line_total_ugx` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_status_history` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`old_status` text,
	`new_status` text NOT NULL,
	`changed_by` text DEFAULT 'system' NOT NULL,
	`reason` text,
	`changed_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`customer_name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`location` text NOT NULL,
	`notes` text,
	`payment_method` text DEFAULT 'COD' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`subtotal_ugx` integer NOT NULL,
	`delivery_fee_ugx` integer DEFAULT 0 NOT NULL,
	`total_ugx` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);