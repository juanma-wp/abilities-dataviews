<?php
/**
 * Plugin Name: Abilities DataViews
 * Plugin URI: https://example.com
 * Description: Simple DataViews testing plugin
 * Version: 1.0.0
 * Author: Your Name
 * License: GPL v2 or later
 * Text Domain: abilities-dataviews
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Plugin constants
define( 'ABILITIES_DATAVIEWS_URL', plugin_dir_url( __FILE__ ) );
define( 'ABILITIES_DATAVIEWS_PATH', plugin_dir_path( __FILE__ ) );

// Enqueue scripts
function abilities_dataviews_enqueue_scripts( $hook ) {
	if ( 'toplevel_page_abilities-dataviews' !== $hook ) {
		return;
	}

	$asset_file = include ABILITIES_DATAVIEWS_PATH . 'build/index.asset.php';

	wp_enqueue_script(
		'abilities-dataviews-script',
		ABILITIES_DATAVIEWS_URL . 'build/index.js',
		$asset_file['dependencies'],
		$asset_file['version'],
		true
	);
}
add_action( 'admin_enqueue_scripts', 'abilities_dataviews_enqueue_scripts' );

// Add admin menu
function abilities_dataviews_add_menu() {
	add_menu_page(
		'Abilities DataViews',
		'Abilities DataViews',
		'manage_options',
		'abilities-dataviews',
		'abilities_dataviews_render_page',
		'dashicons-forms',
		30
	);
}
add_action( 'admin_menu', 'abilities_dataviews_add_menu' );

// Render admin page
function abilities_dataviews_render_page() {
	?>
	<div class="wrap">
		<h1>Abilities DataViews</h1>
		<div id="abilities-dataviews-root"></div>
	</div>
	<?php
}
