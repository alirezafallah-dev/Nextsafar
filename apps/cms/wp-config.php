<?php
/**
 * NextSafar WordPress Configuration
 */

// Database settings (MySQL برای وردپرس)
define( 'DB_NAME', 'nextsafar_wp' );
define( 'DB_USER', 'nextsafar_wp_user' );
define( 'DB_PASSWORD', 'NextSafar@WP2026!Secure' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8mb4' );
define( 'DB_COLLATE', '' );

// Authentication Keys and Salts
define('AUTH_KEY',         '3Xk;pNqtw}aU `O&J7jpDe>|Q=dU,-Plw-&]+ NY2?a*i-s=Y0AtdJGS|7;:$HX+');
define('SECURE_AUTH_KEY',  'C-*pR+Z^o=-F*~-P,/pt|kz:akj;QwecG{js.2r=T4nk>x[Vb%!<nf-R-GWUfr0W');
define('LOGGED_IN_KEY',    '~V+M+`W%Dj[[XTVAXgCarOA2w]fFG9iaoCsOf_^3mo^y{G6P_z[O?kpv3Q6qn4Ow');
define('NONCE_KEY',        'C9R#cs$Q@M $K]pSXLo|M1XAlufn|cC%4#jXi/m(^QNnVux]a&:OgL)Y2;PN+2I^');
define('AUTH_SALT',        'b}QE8Sn!a2p]Rq5<uZ;P3e]fyZmJ0?;#I0JySv[R6Y6@xx:}iPY,)|1z[ZC7>pV/');
define('SECURE_AUTH_SALT', ']dTaFQ4nK6DVf.b_[./|u1XWZ1&,p!OrZ-2|.DMu^$l30<Ei^0!%s@_2qtHqU$ok');
define('LOGGED_IN_SALT',   '6-UA{H1mqI}O_2i*IEBOl`5ndm=xL5D!,?;E$^JSs8p94K6RAmV{c`}X-F-=Ws24');
define('NONCE_SALT',       '<-?w8Bg<:#q}q|io,7G-BW$TyWBAm-T`GyitOzk#Yhnk.P!w+#y]Qqi|ZvE[Lj2B');


// Database Table prefix
$table_prefix = 'ns_';

// Debug Mode
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'WP_DEBUG_DISPLAY', false );
define( 'SCRIPT_DEBUG', true );

// Headless Mode
define( 'WP_SITEURL', 'http://cms.nextsafar.local' );
define( 'WP_HOME', 'http://cms.nextsafar.local' );

// Performance
define( 'WP_MEMORY_LIMIT', '256M' );
define( 'WP_MAX_MEMORY_LIMIT', '512M' );
define( 'WP_POST_REVISIONS', 5 );
define( 'WP_AUTO_UPDATE_CORE', false );
define('FS_METHOD', 'direct');
define('WPLANG', 'fa_IR');

if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

require_once ABSPATH . 'wp-settings.php';
