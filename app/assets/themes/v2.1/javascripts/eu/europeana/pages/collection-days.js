/*global europeana, I18n, jQuery */
/*jslint browser: true, white: true */
(function( $ ) {

	'use strict';

	var
	chosen = {
		/**
		 * @param {Event} arguments[0]
		 * jQuery Event
		 *
		 * @param {object} arguments[1]
		 * @param {string} arguments[1].selected
		 */
		handleChange: function() {
			if (
				arguments[1] === undefined ||
				arguments[1].selected === undefined
			) {
				return;
			}

			var pieces = arguments[1].selected.split('|');

			if ( pieces.length === 2 && pieces[1] === 'searchable' ) {
				window.location.href =
					window.location.protocol + "//" +
					window.location.host + "/" +
					'collection/explore/collection_day/' +
					pieces[0] +
					'?qf[index]=c';
			} else {
				window.location.href =
					window.location.protocol + "//" +
					window.location.host + "/" +
					'collection-days/' +
					arguments[1].selected;
			}
		},

		init: function() {
			$('.chosen-select').chosen().change( this.handleChange );
		}
	},

	leaflet = {
		add_markers_as_cluster: true,
		banner_content: '',
		legend_content: '',
		$toggle_previous: {},


		addLeafletMap: function() {
			var
				map_config = {},
				map_options,
				markers;

			if (
				RunCoCo.leaflet.markers !== undefined &&
				$.isArray( RunCoCo.leaflet.markers )
			) {
				markers = RunCoCo.leaflet.markers;
			}

			if ( RunCoCo.leaflet.map_options !== undefined ) {
				map_options = RunCoCo.leaflet.map_options;
			}

			map_options.zoomControl = new L.Control.Zoom({
				position: 'bottomleft'
			});

			map_config.map_options = map_options;
			map_config.markers = markers;
			map_config.add_markers_as_cluster = this.add_markers_as_cluster;

			if ( $( window ).width() > 768 ) {
				map_config.banner = {
					display: true,
					content: this.banner_content
				};

				map_config.legend = {
					display: true,
					content: this.legend_content
				};
			}

			europeana.leaflet.init( map_config );
		},

		addPreviousToggleListener: function() {
			this.$toggle_previous = $('#toggle-previous');
			this.$toggle_previous.on('click', this.handlePreviousToggle );
		},

		handlePreviousToggle: function() {
			if ( europeana.leaflet.past_collection_day_layer._layers === undefined ) {
				return;
			}

			if ( $(this).attr('checked') ) {
				$.cookie('show-previous', true, { path: '/' });
			} else {
				$.cookie('show-previous', false, { path: '/' });
			}

			$.each( europeana.leaflet.past_collection_day_layer._layers, function() {
				$(this._icon).fadeToggle();
			});
		},

		init: function() {
			if ( RunCoCo.leaflet === undefined ) {
				return;
			}

			this.setLegendContent();
			this.setBannerContent();
			this.addLeafletMap();

			if ( !this.add_markers_as_cluster ) {
				this.removePreviousMarkersOpacity();
				this.addPreviousToggleListener();
				this.setPreviousCheckboxState();
			}
		},

		removePreviousMarkersOpacity: function() {
			if ( europeana.leaflet.past_collection_day_layer._layers === undefined ) {
				return;
			}

			$.each( europeana.leaflet.past_collection_day_layer._layers, function() {
				if ( $.cookie('show-previous') === 'true' ) {
					$(this._icon).css({'opacity':''});
				} else {
					$(this._icon).css({'display':'none','opacity':''});
				}
			});
		},

		setBannerContent: function() {
			if (
				!$.isArray( RunCoCo.leaflet.upcoming ) ||
				RunCoCo.leaflet.upcoming.length < 1
			) {
				return;
			}

			var
			upcoming_day = RunCoCo.leaflet.upcoming[0],
			upcoming_values = {
				"name": upcoming_day.name ? upcoming_day.name : '',
				"city": upcoming_day.city ? upcoming_day.city: '',
				"country": upcoming_day.country ? upcoming_day.country : '',
				"start-date": upcoming_day.date ? upcoming_day.date : ''
			};

			this.banner_content =
				I18n.t(
					'javascripts.collection-days.next-collection-day',
					upcoming_values
				) +
				' ' +
				'<a href="collection-days/' + RunCoCo.leaflet.upcoming[0].code + '">' +
					I18n.t( 'javascripts.collection-days.find-more' ) +
				'</a>';
		},

		setLegendContent: function() {
			this.legend_content =
				'<h2>' + I18n.t( 'javascripts.collection-days.legend' ) + '</h2>' +
				'<div class="marker-icon marker-icon-blue">' + I18n.t( 'javascripts.collection-days.upcoming' ) + '</div>' +
				'<div class="marker-icon marker-icon-red">' + I18n.t( 'javascripts.collection-days.past-entered' ) + '</div>' +
				'<div class="marker-icon marker-icon-purple">' + I18n.t( 'javascripts.collection-days.past-not-entered' ) + '</div>';

			if ( !this.add_markers_as_cluster ) {
				this.legend_content += '<label><input type="checkbox" id="toggle-previous" /> ' + I18n.t( 'javascripts.collection-days.show-past' ) + '</label>';
			}

			this.legend_content += '<a href="#what-is-it">' + I18n.t( 'javascripts.collection-days.what-is-it' ) + '</a>';
		},

		setPreviousCheckboxState: function() {
			if ( $.cookie('show-previous') === 'true' ) {
				this.$toggle_previous.attr('checked', 'checked');
			}
		}
	};

	chosen.init();
	leaflet.init();

}( jQuery ));
