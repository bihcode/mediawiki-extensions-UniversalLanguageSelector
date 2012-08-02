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

( function( $ ) {
	"use strict";

	$( document ).ready( function( ) {
		var $ulsTrigger = $( '.uls-trigger' );
		/**
		 * Change the language of wiki using setlang URL parameter
		 * @param {String} language
		 */
		var changeLanguage = function( language ) {
			$.cookie( 'uls-previous-language', mw.config.get( 'wgUserLanguage' ) );
			var uri = new mw.Uri( window.location.href );
			uri.extend( {
				setlang: language
			} );
			window.location.href = uri.toString();
		};

		$ulsTrigger.uls( {
			onSelect: function( language ) {
				changeLanguage( language );
			},
			searchAPI: mw.util.wikiScript( 'api' ) + "?action=languagesearch"
		} );

		// Attach a tipsy tooltip to the trigger
		$ulsTrigger.tipsy( {
			gravity: 'n',
			delayOut: 3000,
			html: true,
			fade: true,
			trigger: 'manual',
			title: function() {
				var prevLang = $.cookie( 'uls-previous-language' );
				if ( !prevLang ) {
					return '';
				}
				var prevLangName = $.uls.data.autonym( prevLang ),
					linkClass = 'uls-lang-link',
					title = "Language changed from <a href='#' lang = '" +
						prevLang + "' class = '" + linkClass + "' >" +
						prevLangName + "</a>",
					currentLang = mw.config.get( 'wgUserLanguage' );
				if ( !prevLang && prevLang === currentLang ) {
					return '';
				}
				return title;
			}
		} );
		var tipsyTimer;
		// Show the tipsy tooltip on page load.
		$ulsTrigger.tipsy( 'show' );
		tipsyTimer = setTimeout( function() {
				$ulsTrigger.tipsy('hide');
			},
			// The timeout after page reloading is longer,
			// to give the user a better chance to see it.
			6000
		);
		$( '.tipsy' ).live( 'mouseout', function( e ) {
			tipsyTimer = setTimeout( function() {
				$ulsTrigger.tipsy('hide');
				},
				3000 // hide the link in 3 seconds
			);
		} );
		// if the mouse is over the tooltip, do not hide
		$( '.tipsy' ).live( 'mouseover', function( e ) {
			clearTimeout( tipsyTimer );
		} );
		// manually show the tooltip
		$ulsTrigger.bind( 'mouseover', function( e ) {
			$( this ).tipsy( 'show' );
		} );
		// hide the tooltip when clicked on uls trigger
		$ulsTrigger.bind( 'click', function( e ) {
			$( this ).tipsy( 'hide' );
		} );
		// Event handler for links in the tooltip
		$( 'a.uls-lang-link' ).live( 'click', function() {
			changeLanguage( $(this).attr( 'lang' ) );
		} );
	} );
} )( jQuery );
