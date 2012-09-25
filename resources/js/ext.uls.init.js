/**
 * ULS startup script.
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

( function ( $, mw, window, document, undefined ) {
	"use strict";

	// MediaWiki override for ULS defaults.
	$.fn.uls.defaults = $.extend( $.fn.uls.defaults, {
		languages: mw.config.get( 'wgULSLanguages' ),
		searchAPI: mw.util.wikiScript( 'api' ) + "?action=languagesearch"
	} );

	var currentLang = mw.config.get( 'wgUserLanguage' );
	mw.uls = mw.uls || {};
	mw.uls.previousLanguagesCookie = 'uls-previous-languages';
	/**
	 * Change the language of wiki using setlang URL parameter
	 * @param {String} language
	 */
	mw.uls.changeLanguage = function ( language ) {
		var uri = new mw.Uri( window.location.href );
		uri.extend( {
			setlang: language
		} );
		window.location.href = uri.toString();
	};

	mw.uls.setPreviousLanguages = function ( previousLanguages ) {
		$.cookie( mw.uls.previousLanguagesCookie, $.toJSON( previousLanguages ) );
	};

	mw.uls.getPreviousLanguages = function () {
		var previousLanguages = $.cookie( mw.uls.previousLanguagesCookie );
		if ( !previousLanguages ) {
			return [];
		}
		// return last 5 language changes
		return $.parseJSON( previousLanguages ).slice( -5 );
	};

	mw.uls.getBrowserLanguage = function () {
		return ( window.navigator.language || window.navigator.userLanguage ).split( '-' )[0];
	};

	mw.uls.getAcceptLanguageList = function () {
		return mw.config.get( "wgULSAcceptLanguageList" );
	};

	mw.uls.getFrequentLanguageList = function () {
		var unique = [],
			list = [
				mw.config.get( 'wgUserLanguage' ),
				mw.config.get( 'wgContentLanguage' ),
				mw.uls.getBrowserLanguage()
			]
				.concat( mw.uls.getPreviousLanguages() )
				.concat( mw.uls.getAcceptLanguageList() );
		if ( window.GEO ) {
			list = list.concat( $.uls.data.languagesInTerritory( window.GEO.country_code ) );
		}
		$.each( list, function ( i, v ) {
			if ( $.inArray( v, unique ) === -1 ) {
				unique.push( v );
			}
		} );
		// Filter out unknown and unsupported languages
		unique = $.grep( unique, function ( langCode, index ) {
			return $.fn.uls.defaults.languages[langCode];
		} );
		return unique;
	};

	$( document ).ready( function () {
		var extensionPath = mw.config.get( 'wgExtensionAssetsPath' ) +
		'/UniversalLanguageSelector/';
		// i18n initialization
		var i18n = $.i18n( {
			locale: currentLang,
			messageLocationResolver: function ( locale ) {
				return extensionPath + 'i18n/' + locale + '.json';
			}
		} );
		// localization for jquery.uls
		i18n.load( extensionPath + 'lib/jquery.uls/i18n/' + currentLang + ".json", currentLang );
		// localization for mediaWiki ULS
		i18n.load( extensionPath + 'i18n/' + currentLang + ".json", currentLang );
		var $ulsTrigger = $( '.uls-trigger' ),
			previousLanguages = mw.uls.getPreviousLanguages() || [],
			previousLang = previousLanguages.slice( -1 )[0];

		function displaySettings () {
			var $displaySettingsTitle = $( '<div data-i18n="ext-uls-display-settings-title">' )
				.addClass( 'settings-title' );
			var $displaySettingsText = $( '<span data-i18n="ext-uls-display-settings-desc">' )
				.addClass( 'settings-text' );
			var $displaySettings = $( '<div>' )
				.addClass( 'display-settings-block' )
				.prop( 'id', 'display-settings-block' )
				.append( $displaySettingsTitle )
				.append( $displaySettingsText );
			return $displaySettings;
		}

		function addDisplaySettings ( uls ) {
			var $displaySettings = displaySettings();
			uls.$menu.find( "div#settings-block" ).append( $displaySettings );
			var position = uls.position();
			$displaySettings.languagesettings( {
				defaultModule: 'display',
				onClose: function () {
					uls.show();
				},
				top: position.top,
				left: position.left
			} );
			$displaySettings.on( 'click', function () {
				uls.hide();
			} );
		}

		$ulsTrigger.uls( {
			onReady: function ( uls ) {
				addDisplaySettings( uls );
			},
			onSelect: function ( language ) {
				mw.uls.changeLanguage( language );
			},
			languages: mw.config.get( 'wgULSLanguages' ),
			searchAPI: mw.util.wikiScript( 'api' ) + "?action=languagesearch",
			quickList: function () {
				return mw.uls.getFrequentLanguageList();
			}
		} );

		if ( !previousLang ) {
			previousLanguages.push( currentLang );
			mw.uls.setPreviousLanguages( previousLanguages );
			// Do not show tooltip.
			return true;
		}

		if ( previousLang === currentLang ) {
			// Do not show tooltip.
			return true;
		}

		var tipsyTimer;
		previousLanguages.push( currentLang );
		mw.uls.setPreviousLanguages( previousLanguages );
		// Attach a tipsy tooltip to the trigger
		$ulsTrigger.tipsy( {
			gravity: 'n',
			delayOut: 3000,
			html: true,
			fade: true,
			trigger: 'manual',
			title: function () {
				var prevLangName = $.uls.data.autonym( previousLang );
				var linkClass = 'uls-lang-link';
				var prevLangLink = "<a href='#' lang = '" +
					previousLang + "' class = '" + linkClass + "' >" +
					prevLangName + "</a>";
				var title = $.i18n( "ext-uls-undo-language-tooltip-text", prevLangLink );
				return title;
			}
		} );
		// Show the tipsy tooltip on page load.
		$ulsTrigger.tipsy( 'show' );
		tipsyTimer = window.setTimeout( function () {
				$ulsTrigger.tipsy( 'hide' );
			},
			// The timeout after page reloading is longer,
			// to give the user a better chance to see it.
			6000
		);

		// manually show the tooltip
		$ulsTrigger.on( 'mouseover', function ( e ) {
			$( this ).tipsy( 'show' );
			// if the mouse is over the tooltip, do not hide
			$( '.tipsy' ).on( 'mouseover', function ( e ) {
				window.clearTimeout( tipsyTimer );
			} );
			$( '.tipsy' ).on( 'mouseout', function ( e ) {
				tipsyTimer = window.setTimeout( function () {
					$ulsTrigger.tipsy( 'hide' );
				}, 3000 // hide the link in 3 seconds
				);
			} );
		} );
		// hide the tooltip when clicked on uls trigger
		$ulsTrigger.on( 'click', function ( e ) {
			$( this ).tipsy( 'hide' );
		} );
		// Event handler for links in the tooltip
		$( 'a.uls-lang-link' ).on( 'click', function () {
			mw.uls.changeLanguage( $( this ).attr( 'lang' ) );
		} );
	} );
}( jQuery, mediaWiki, window, document ) );
