<?php
/**
 * Initialisation file for MediaWiki extension UniversalLanguageSelector.
 *
 * Copyright (C) 2012 Alolita Sharma, Amir Aharoni, Arun Ganesh, Brandon Harris,
 * Niklas Laxström, Pau Giner, Santhosh Thottingal, Siebrand Mazeland and other
 * contributors. See CREDITS for a list.
 *
 * UniversalLanguageSelector is dual licensed GPLv2 or later and MIT. You don't
 * have to do anything special to choose one license or the other and you don't
 * have to notify anyone which license you are using. You are free to use
 * UniversalLanguageSelector in commercial projects as long as the copyright
 * header is left intact. See files GPL-LICENSE and MIT-LICENSE for details.
 *
 * @file
 * @ingroup Extensions
 * @licence GNU General Public Licence 2.0 or later
 * @licence MIT License
 */

if ( !defined( 'MEDIAWIKI' ) ) {
	echo( "This file is an extension to the MediaWiki software and cannot be used standalone.\n" );
	die( -1 );
}
/**
 * Version number used in extension credits and in other placed where needed.
 */
define( 'ULS_VERSION', '2013-01-28' );

$wgExtensionCredits['other'][] = array(
	'path' => __FILE__,
	'name' => 'UniversalLanguageSelector',
	'version' => '[https://www.mediawiki.org/wiki/MLEB MLEB 2013.03]',
	'author' => array(
		'Alolita Sharma',
		'Amir Aharoni',
		'Arun Ganesh',
		'Brandon Harris',
		'Niklas Laxström',
		'Pau Giner',
		'Santhosh Thottingal',
		'Siebrand Mazeland'
	),
	'url' => 'https://www.mediawiki.org/wiki/Extension:UniversalLanguageSelector',
	'descriptionmsg' => 'uls-desc',
);

/**
 * ULS can use geolocation services to suggest languages based on the
 * country the user is vising from. Setting this to false will prevent
 * builtin geolocation from being used. You can provide your own geolocation
 * by setting window.Geo to object which has key 'country_code' or 'country'.
 * This is what Wikipedia does.
 *
 * The service should return jsonp that uses the supplied callback parameter.
 */
$wgULSGeoService = 'http://freegeoip.net/json/';

/**
 * IME system of ULS can be disabled by setting this value false;
 */
$wgULSIMEEnabled = true;

/**
 * Try to use preferred interface language for anonymous users.
 * Do not use if you are caching anonymous page views without
 * taking Accept-Language into account.
 */
$wgULSLanguageDetection = true;

/**
 * Enable language selection. If language selection is disabled, the classes
 * and RL modules are registered for the use of other extensions, but no
 * language selection toolbar is shown, and it will not be possible to change
 * the interface language using a cookie.
 */
$wgULSEnable = true;

/**
 * Enable ULS language selection for anonymous users. Equivalent to $wgULSEnable
 * except that it only applies to anonymous users. Setting this to false will
 * avoid breaking Squid caches (see bug 41451).
 */
$wgULSEnableAnon = true;

$dir = __DIR__;

// Internationalization
$wgExtensionMessagesFiles['UniversalLanguageSelector'] = "$dir/UniversalLanguageSelector.i18n.php";

// Register auto load for the page class
$wgAutoloadClasses['UniversalLanguageSelectorHooks'] = "$dir/UniversalLanguageSelector.hooks.php";
$wgAutoloadClasses['ApiLanguageSearch'] = "$dir/api/ApiLanguageSearch.php";
$wgAutoloadClasses['LanguageNameSearch'] = "$dir/data/LanguageNameSearch.php";

$wgHooks['BeforePageDisplay'][] = 'UniversalLanguageSelectorHooks::addModules';
$wgHooks['PersonalUrls'][] = 'UniversalLanguageSelectorHooks::addTrigger';
$wgHooks['ResourceLoaderTestModules'][] = 'UniversalLanguageSelectorHooks::addTestModules';
$wgHooks['ResourceLoaderGetConfigVars'][] = 'UniversalLanguageSelectorHooks::addConfig';
$wgHooks['MakeGlobalVariablesScript'][] = 'UniversalLanguageSelectorHooks::addVariables';
$wgAPIModules['languagesearch'] = 'ApiLanguageSearch';
$wgHooks['UserGetLanguageObject'][] = 'UniversalLanguageSelectorHooks::getLanguage';

$wgDefaultUserOptions['uls-preferences'] = '';
$wgHooks['GetPreferences'][] = 'UniversalLanguageSelectorHooks::onGetPreferences';

require( "$dir/Resources.php" );
