/**
 *	@author dan entous <contact@gmtplusone.com>
 *	@version 2012-05-19 16:19 gmt +1
 */
(function() {

	'use strict';	
	
	
	var carousels = {
		
		$featured : null,
		$thumbnail : null,
		thumbnail_page_nr : 1,
		$thumbnail_counts : jQuery('#thumbnail-counts'),
		$thumbnail_links : jQuery('#contributions-thumbnails ul a'),
		$pagination : jQuery('#contributions-pagination .pagination a'),
		
		
		updateTumbnailCarouselPosition : function( selected_index, dir ) {
			
			if ( !this.$thumbnail ) { return; }
			
			var items_per_container = this.$thumbnail.data( 'rCarousel' ).get( 'items_per_container' );
			
			if ( dir ) {
				
				if ( 'next' === dir && 0 === selected_index % items_per_container ) {
					
					this.$thumbnail.data( 'rCarousel' ).$next.trigger('click');
					
				} else if ( 'prev' === dir && 0 === ( selected_index + 1 ) % items_per_container ) {
					
					this.$thumbnail.data( 'rCarousel' ).$prev.trigger('click');
					
				}
				
			}
			
		},
		
		
		toggleSelected : function( selected_index, dir ) {
			
			var self = this;
			
			
			self.$thumbnail_links.each(function(index) {
					
					var $elm = jQuery(this);
					
					if ( index === selected_index ) {
						
						if ( !$elm.hasClass('selected') ) {
							
							$elm.addClass('selected');
							
						}
						
					} else {
						
						$elm.removeClass('selected');
						
					}
					
			});
			
			self.updateTumbnailCarouselPosition( selected_index, dir );
			
		},
		
		
		updateCounts : function() {
			
			this.$thumbnail_counts.html(
				I18n.t('javascripts.thumbnails.item') + ' ' + ( carousels.$featured.data( 'rCarousel' ).get('current_item_index') + 1 ) +
				' ' + I18n.t('javascripts.thumbnails.of') + ' ' + jQuery('#attachment-total').text()
			);
			
		},
		
		
		handleThumbnailClick : function( evt ) {
			
			var self = evt.data.self,
					index = evt.data.index;
			
			
			evt.preventDefault();
			
			self.toggleSelected( index );
			carousels.$featured.data( 'rCarousel' ).goToIndex( index );
			self.updateCounts();
			
		},
		
		
		addThumbnailClickHandlers : function() {
			
			var self = this;
			
			self.$thumbnail_links.each(function(index) {
				
				var $elm = jQuery(this);
				$elm.on( 'click', { self : self, index : index }, carousels.handleThumbnailClick );
				
			});
			
		},
		
	
		init : function() {
			
			var self = this;
			
			self.$featured =
				jQuery('#contributions-featured').rCarousel({
					callbacks : {
						after_nav : function( dir ) {
							self.updateCounts();
							self.toggleSelected( self.$featured.data( 'rCarousel' ).get('current_item_index'), dir );
						}
					}
				});
			
			
			jQuery('#contributions-thumbnails').imagesLoaded(function() {
				self.$thumbnail =
					this.rCarousel({
						listen_to_arrow_keys : false,
						item_width_is_container_width : false,
						nav_button_size : 'small',
						callbacks : {
							after_nav : function() { self.updateCounts(); }
						}
					});
			});
			
			self.addThumbnailClickHandlers();
			self.updateCounts();
			self.toggleSelected( self.$featured.data( 'rCarousel' ).get('current_item_index') );
			
			
			
		}
		
	},
	
	
	image_lazyload = {
		
		
		init : function() {
			
			jQuery('img.lazy').lazyload();
			
		}
		
	},
	
	
	lightbox = {
		
		$metadata : [],
		current : 0,
		
		
		addMetaDataOverlay : function( $elm ) {
			
			var self = this,
					$metadata,
					$pic_full_res = jQuery('#pp_full_res'),
					$pp_content = jQuery('.pp_content');
			
			
			if ( !self.$metadata[ self.current ]) {
				
				self.$metadata[self.current] = ( jQuery( $elm.attr('href') ) );
				self.$metadata[self.current].data( 'cloned', false );
				
			}
			
			$metadata = self.$metadata[self.current];
			
			if ( !$metadata.data('cloned') ) {
				
				$metadata.data('clone', $metadata.clone() );
				$metadata.data('clone').appendTo( $pp_content );
				
				$metadata.data('clone').css({
					height : $pic_full_res.find('img').height() - parseInt( $metadata.data('clone').css('padding-top'), 10 ) - parseInt( $metadata.data('clone').css('padding-bottom'), 10 )
				});
				
				$pic_full_res.append( $metadata.find('.metadata-license').html() );
				$metadata.data('cloned', true);
				
			}
			
		},
		
		
		handleMetaDataClick : function( evt ) {
			
			var self = evt.data.self;
			
			evt.preventDefault();	
			self.$metadata[self.current].data('clone').slideToggle();
			
		},
		
		
		/**
		 *	this - refers to the generated lightbox div
		 *	the div is removed each time the lightbox is closed
		 *	so these elements need to be added back to the div
		 *	with each open
		 */
		handlePictureChange : function() {
			
			var self = lightbox,
					$elm = jQuery(this),
					$additional_info_link = $elm.find('.pp_description a').first();			
			
			
			if ( self.$metadata[self.current] ) {
				
				if ( self.$metadata[self.current].data('clone').is(':visible') ) {
					
					self.$metadata[self.current].data('clone').hide();
					
				}
				
				if ( self.$metadata[self.current].data('cloned') ) {
					
					self.$metadata[self.current].data('cloned', false);
					
				}
				
			}
			
			$additional_info_link.on('click', { self : self }, self.handleMetaDataClick );
			self.current = parseInt( $additional_info_link.attr('href').replace('#inline-',''), 10 );
			self.addMetaDataOverlay( $additional_info_link );
			
		},
		
		
		setupPrettyPhoto : function() {
			
			var self = this;
			
			jQuery("a[rel^='prettyPhoto']").prettyPhoto({
				
				description_src : 'data-description',
				changepicturecallback : self.handlePictureChange
				
			});
			
		},
		
		init : function() {
			
			if ( jQuery(window).width() <= 768 && jQuery(window).height() <= 600 ) {
			
				jQuery('#contributions-featured a').each(function() {
					
					jQuery(this).on('click', function(evt) { evt.preventDefault(); });
					
				});
				
				return;
				
			}
			
			this.setupPrettyPhoto();
			
		}
		
	},
	
	
	map = {
		
		$map : jQuery('#location-map'),
		$overlay : jQuery('<div/>', { 'class' : 'carousel-overlay' }),
		$story_map : jQuery('<div/>', { id : 'story-map' }),
		$google_map : jQuery('<div/>', { id : "google-map" }),
		placename : jQuery('#location-placename').val(),
		$placename_link : jQuery('<a/>'),
		$story_took_place : jQuery('<b/>'),
		
		
		addMapContainer : function() {
			
			jQuery('#thumbnail-counts')
				.after(
					jQuery( this.$google_map )
						.append( this.$story_took_place )
						.append( this.$story_map )
						.append( this.$overlay )
				);
			
			this.$story_map.css( 'height', jQuery('.one-half-right').width() );
			
		},
		
		
		removeOverlay : function() {
			
			if ( map.$overlay.is(':visible') ) {
				
				setTimeout( function() { map.$overlay.fadeOut(); }, 200 );
				
			}
			
		},
		
		
		locationMap : function() {
			
			if ( this.$map.length === 1 ) {
				
				this.addMapContainer();
				RunCoCo.GMap.Display.init('story-map', this.removeOverlay );
				
			}
			
		},
		
		
		addStoryTookPlace : function() {
			
			var self = this;
			
			if ( self.placename ) {
				
				self.$placename_link
					.attr('href', '/contributions/search?q=' + self.placename.replace(/,/g,'').replace(/ /g,'+') )
					.html( self.placename );
			
				self.$story_took_place
					.append( I18n.t('javascripts.story.took-place') + ' ' )
					.append( self.$placename_link );
				
			}
			
		},
		
		
		init : function() {
			
			this.addStoryTookPlace();
			this.locationMap();
			
		}
		
	},
	
	
	truncate = {
		
		init : function() {
			
			if ( jQuery('#avatar').length < 1 ) { return; }
			
			jQuery('#story-metadata').truncate({
				limit : { pixels : 400 },
				toggle_html : {
					more : I18n.t('javascripts.truncate.show-more'),
					less : I18n.t('javascripts.truncate.show-less')
				}
			});
			
		}
		
	};	
	
	
	(function() {
		
		truncate.init();
		// image_lazyload.init();
		RunCoCo.translation_services.init( jQuery('#story-metadata') );
		carousels.init();
		map.init();
		lightbox.init();
		
	}());
	
	
}());