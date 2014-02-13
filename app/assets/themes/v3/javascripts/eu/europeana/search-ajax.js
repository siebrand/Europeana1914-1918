/**
 * Andy MacLean
 * 
 * Allows data provided by the portal to be navigated without page reloads.
 * 
 * 
 * TODO:
 * 
 * refine form 
 * 
 * 
 * */

// kill firefox cache
$(":checkbox").attr("autocomplete", "off");
$("input").attr("autocomplete", "off");

EUSearchAjax = function(){
	
    var self                    = this;
    var container               = false;
    var itemTemplate            = false;
    var facetTemplate           = false;
    
    var ajaxUrl                 = false;
    var searchUrlStem			= 'europeana';
    var searchUrl				= '/search.json';
    
    var defaultRows             = 6;
    var facetless               = false;
    var pagination              = false;
    var paginationData          = typeof defPaginationData != 'undefined' ? defPaginationData : {};
    
   
    var doSearch = function(startParam, query){	
    	showSpinner();
    	try{
	    	ajaxUrl = buildUrl(startParam, query);
	
	        if(typeof ajaxUrl != 'undefined' && ajaxUrl.length){
                $.ajax({
                    "url" : ajaxUrl,
                    "type" : "GET",
                    "crossDomain" : true,
                    "dataType" : "script",
                    "contentType" :	"application/x-www-form-urlencoded;charset=UTF-8"
                });
	        }
	        else{
	            self.q.addClass('error-border');
	        }
    	}
    	catch(e){
    		facetless = false;
        	hideSpinner();
    		console.log(e);
    	}
    };

    
    // build search param from url-fragment hrefs.  @startParam set to 1 if not specified
    var buildUrl = function(startParam, query){

    	console.log("buildUrl() @startParam= " + startParam + ", @query = " + query);
        var term = query ? query : self.q.val();
        
        if (!term) {
        	alert('return no term');
            return '';
        }
        
        var url = '';
		var param = function(urlIn){
			return ((urlIn ? urlIn : url).indexOf('?')>-1) ? '&' : '?';
		};

		
		var rows = parseInt(self.resMenu1.getActive() ? self.resMenu1.getActive() : defaultRows);		
		url = '/' + I18n.locale + '/' + searchUrlStem + searchUrl + (query ? query : '?q=' + term); 	
    	url += "&profile=facets,params&callback=searchAjax.showRes";
    	url += '&count='  + rows;
    	url += '&start=' + (startParam ? startParam : 1);
    	url += '&page='  + (startParam ? Math.ceil(startParam / rows) : 1);
         

    	if(!query){
    		var facetParams = {};
    		var newFacetParamString = '';
    		
    		if(!facetless){
    			container.find('#facets input:checked').each(function(i, ob){
    				var urlFragment = $(ob).next('a').data('value');
    				if(typeof(urlFragment) != 'undefined'){
    					newFacetParamString += urlFragment;
    				}
    			});	       
    			url += newFacetParamString;
    		}
    	}
    
		console.log('final search url: ' + url);
		return url;
    };

    
    var bindFilterLinks = function(){

    	// remove all selected facets below this
    	
       	container.find('ul.filters a').not('.remove-filter').each(function(i, ob){
       		$(ob).click(function(e){
       			e.preventDefault();
       			var urlFragment = $(e.target).data('value');
       			var filterLinks = $('.filters a[data-value]').not('.remove-filter'); // get filter links with a data value more specific than the clicked one
       			
       			$.each(filterLinks, function(j, filterLink){
       				filterLink = $(filterLink);
       				var dVal = filterLink.data('value');
       				
       				if(dVal.indexOf(urlFragment) == 0 && dVal.length > urlFragment.length){
       					var rmDataVal = filterLink.next('a').data('value');
       					var toUncheck = $('#facets ul:not(.filters):not(.keywords) a[data-value="' + rmDataVal + '"]');
	       				toUncheck.prev('input').prop('checked', false);
       				}
       			});
       			doSearch();
       		});
       		
       	});
       	
       	// remove this specific facet
       	
    	container.find('ul.filters a.remove-filter').each(function(i, ob){
       		$(ob).click(function(e){       			
       			e.preventDefault();
       			var urlFragment = $(e.target).parent().data('value');
       			
       			if(urlFragment.indexOf('&q=')==0){
       				self.q.val('*');
       				$('#q').val('*');
       			}
       			else{
           			var cb = $('a[data-value="' + urlFragment + '"]');
           			cb.prev('input').prop('checked', false);       				
       			}
       			
       			doSearch();
       		});
       	});
    };
    
    // binds facet links to the doSearch function
    var bindFacetLinks = function(){
    	
    	container.find('#facets ul li input[type="checkbox"]').each(function(i, ob){
            ob = $(ob);            
    		ob.attr({
                "name"  : "cb-" + i,
                "id"    : "cb-" + i
            });
    		
    		// add "for" attribute to label and "remove" image - this for checkbox interoperability
            ob.next('a').find('label').attr('for', "cb-" + i).parent().next('a').find('img').attr('for', "cb-" + i);
    	});
    	
        
    	
    	var clickFn = function(e){
    		var cb = $(e.target);
    		
    		if(cb.attr("for")){
    			if(e.target.nodeName.toUpperCase()=='IMG'){
                    e.preventDefault();
                    container.find('#facets #' + cb.attr("for")).click();
    			}
    			else{
    				alert("what's this???");
    			}
    		}
    		else{
    			//e.preventDefault();
    			
    			//cb.prop('checked', !cb.prop('checked'));
    			// build hidden input based on href of next link element (TODO - fix brittle design) - this keeps the facets intact when a refinement is submitted via the form
    			// question: couldn't we just ajaxify the refinement form???
    			
    			/*
    			var refinements = container.find('#refine-search-form');
    			var href = cb.next('a').attr('href');
    			if(cb.prop('checked')){
    				$('<input type="hidden" name="qf" value="' + href + '"/>').appendTo(refinements);
    			}
    			else{
    				var toRemove =  refinements.find('input[value="' + href + '"]');
    				toRemove.remove();
    			}*/
    			setTimeout(function(){
    				doSearch();
    			}, 1);
    			
    			//return false;
    		}
    	}
    	
    	//container.find('#facets ul li a.remove-facet img').click(clickFn);
    	container.find('#facets ul li input').not("#newKeyword").not('input[type="submit"]').change(clickFn);
    };


    /* 
     * callback from API call
     * 
     * */
    var showRes = function(data){

    	console.log("showRes()");
    	
        // Append items
        var grid = container.find('.section.active .stories');
        grid.empty();

        var start = data.params.start ? data.params.start : 1;

        
        // write items to grid
                
        $(data.items).each(function(i, ob){
        	
            var item = itemTemplate.clone();

            var dataStem = $('');
            
            item.find('a').attr({
            	'href': '/' + I18n.locale + '/' + searchUrlStem + '/record' + ((ob.id+'').indexOf('/')==0 ? ob.id : '/' + ob.id) + '.html?start=' + start + '&query=',
            	'title': ob.title
            });

            	
            item.find('.story-title').html(
            	document.createTextNode(ob.title)
            );
                        
            
            var providerFieldHtml = '';
            $.each(['dctermsAlternative', 'dataProvider', 'provider'], function(i, providerField){
            	if(ob[providerField] && ob[providerField].length){
            		providerFieldHtml += '<span class="story-provider">' + ob[providerField] + '</span>';
            	}
            });
            if(providerFieldHtml.length){
            	var existingProviders = item.find('.story-provider');
            	existingProviders.addClass('expired');
            	item.find('.story-title').after(providerFieldHtml);
            	$('.expired').remove();
            }


            if(ob.edmPreview){
	            item.find('img').attr('src', ob.edmPreview[0]);
            }
            
            grid.append(item);
        });


        // pagination
      
        paginationData = {"records":data.totalResults, "rows": data.params.rows, "start": start};
        
        pagination.setData(data.totalResults, data.params.rows, start);


        // result stats

        container.find('.first-vis-record').html(start);
        container.find('.last-vis-record') .html(start - 1 + data.itemsCount);
        container.find('.last-record')     .html(data.totalResults);


        // filters
        
		var url = ajaxUrl;		
				
		//var reg = /qf\[\]=[A-Z]*:[A-Z]*/g;
        //var reg = /q(f\[\])?=[a-zA-Z]*(:[a-zA-Z0-9]*)?/g;
		//var reg = /(q=[a-zA-Z\u00E0-\u00FC0-9\s]*)|qf\[\]=[a-zA-Z\u00E0-\u00FC0-9_]*((\:http\:\/\/[a-zA-Z0-9\./-]+)|(\:[a-zA-Z0-9\u00E0-\u00FC\s_\-\*]*))/g; 
		var reg = /(q=[a-zA-Z\u00E0-\u00FC0-9\s]*)|qf\[\]=[a-zA-Z\u00E0-\u00FC0-9_]*((\:http\:\/\/[a-zA-Z0-9\./-]+)|(\:[a-zA-Z0-9\u00E0-\u00FC\s_\-\*]*))/g; 

		var res = url.match(reg);
		
		if(!res){
			$('ul.filters').empty();
		}	
		else{
	        	
        	// track order of existing facets
        	var ordered   = [];
        		
    		var elFilters = $('ul.filters');

			elFilters.find('li a.remove-filter').each(function(i, filter){
				ordered.push($(filter).data('value'));
			});
			elFilters.empty();

			
    		var cutOffFacetUrl = '';
    		var fullFacetUrl   = '';
        		
    		// reset matches and put them in order 
    		
    		res = url.match(reg);
            res.sort(function(a, b) {
				var score1 = $.inArray('&' + a, ordered);
				var score2 = $.inArray('&' + b, ordered);
				score1 = score1 < 0 ? res.length : score1;
				score2 = score2 < 0 ? res.length : score2;
				return score1 - score2;
    		});
    		
            // loop to build full url
            
            $.each(res, function(i, match){
            	fullFacetUrl += '&' + match;
            });
            

            // build ui
            
    		$.each(res, function(i, match){	        			
    			
    			cutOffFacetUrl += '&' + match;
    			
    			var obMatch = [];
    			if(match.indexOf('qf') == 0){
    				var cpMatch   = match.replace(/qf\[\]=/, '');
    				obMatch = [cpMatch.substr(0, cpMatch.indexOf(':')), cpMatch.substr(cpMatch.indexOf(':')+1, cpMatch.length)];
    			}
    			else{
    				obMatch = match.split('=');        				
    			}
    			
    			var label     = obMatch[0];
    			var value     = obMatch[1];

    			// Show empty searhes 
    			
    			if(!value.length && label == 'q'){
    			   value = '*';
    			}
				
				if(label.toUpperCase() == 'COUNTRY'){
					value = value.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
				}
				if(label.toUpperCase() == 'LANGUAGE'){
					value = languageLabels[value] ? languageLabels[value] : value;
				}
				if(label.toUpperCase() == 'RIGHTS'){
					value = rightsLabels[value] ? rightsLabels[value].label : value;
				}
				else{
					console.log('facet label = ' + label);
				}
				
				var rmFilter = $(
						'<li>'
						+ '<a class="filter-crop" href="' + cutOffFacetUrl + '">' + (label == 'q' ? '' : label + ': ') + value + '</a>'
						+ '<a title="Remove" class="remove-filter">'
						+   '<span class="icon-remove"></span>'
						+ '</a>'
						+ '</li>'
				).appendTo(elFilters);
				
				rmFilter.find('.remove-filter').attr({
					'data-value': '&' + match
				});
				
				rmFilter.find('a:first').attr({
					'data-value':  cutOffFacetUrl
				});
				
				// TODO: remove the 'remove' button if it's an empty search or a trove area (we need access to the provider for that)

    		});
        	
            // filter actions 

            bindFilterLinks();
		}
		
        
        // facets
		
        var facetOrder = ['UGC','LANGUAGE','TYPE','YEAR','PROVIDER','DATA_PROVIDER','COUNTRY','RIGHTS','REUSABILITY'];
        data.facets.sort(function(a, b) {
			var res = $.inArray(a.label, facetOrder) - $.inArray(b.label, facetOrder);
			return res > 0 ? 1 : res < 0 ? -1 : 0;
		});
        
        EUSearch.resetOpenedFacets();
        
        
        var selected = EUSearch.findSelectedFacetOps(true);
        
        container.find('#facets>li').not(".refinements-section").not(".filter-section").remove(); // remove all but the "Add Keyword" refinement form.
                
        // write facet dom

        $(data.facets).each(function(i, ob){
        	
            var facet           = facetTemplate.clone();
            var facetOps        = facet.find('ul');
            var facetOpTemplate = facetOps.find('li:nth-child(1)');
                        
            facet.find('h3 a').html(capitalise(ob.name));
            
            facetOps.empty();            
              
            $.each(ob.fields, function(i, field){
                
                var facetOp     = facetOpTemplate.clone();
            
                var urlFragment = '&qf[]=' + ob.name + ':' + field.label;
                
                if(ob.name.toUpperCase() == 'RIGHTS'){
                	field.label = rightsLabels[field.label] ? rightsLabels[field.label].label : field.label;	
                }
    			if(ob.name.toUpperCase() == 'COUNTRY'){
    				field.label = field.label.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    			}
    			if(ob.name.toUpperCase() == 'LANGUAGE'){
    				field.label = languageLabels[field.label] ? languageLabels[field.label] : field.label;
    			}
                                               
                facetOp.find('h4 a').attr({
                    "data-value"  : urlFragment,
                    "title" : field.label
                });

                facetOps.append( facetOp );
                
                var fCount = field.count && (typeof field.count == 'number' || typeof field.count.toUpperCase() == 'STRING') && $.inArray( facetOp.find('h4 a').data('value'), selected) == -1 ? ' <span class="fcount">(' + field.count + ')</span>' : '';
                facetOp.find('label').html(field.label + fCount).attr({
                    "title" : field.label
                });

                if($.inArray( facetOp.find('h4 a').data('value'), selected) != -1){
                	facetOp.find('label').addClass('bold');
                }
                
            });
            facet.append(facetOps);
            container.find('#facets').append(facet);
        });

        
        // facet collapsibility               
        
        container.find('#facets>li:not(:first)').each(function(i, ob){
        	ob = $(ob);
        	var heading = ob.find('h3 a');
			createCollapsibleSection(ob, function(){
	            return heading.parent().next('ul').first().find('a');   
	        },
	        heading);
        });

        
        hideSpinner();
        facetless = false;
        
        
        // restore facet selection
    

        // TODO: language compatibility

        var labelRemove = 'Remove';
        
        $(selected).each(function(i, ob){
            var object = container.find('#facets ul:not(.filters) a[data-value="' + ob + '"]');
            object.attr('href', '');
            EUSearch.openFacet(object);
            object.prev().prop('checked', true);
        });

        // facet actions 

        bindFacetLinks();

        // kill firefox cache
        $(":checkbox").attr("autocomplete", "off");
        

        // open "Add Keyword"
        //alert('open add keyword');
        if(container.find('#refinements').css('display') == 'none'){
        	container.find('#facets li:first h3 a').click();
        }
        //alert('opened add keyword');


    }; // end showRes

    
    var showSpinner = function(){
    	$('.ajax-overlay').attr('style', 'top:' + $(window).scrollTop() + 'px');
    	$('.ajax-overlay').show();
    };
    
    var hideSpinner = function(){
    	$('.ajax-overlay').hide();
    };
    
    var capitalise = function(str){
    	return (str.substr(0,1).toUpperCase() + str.substr(1).toLowerCase() ).replace(/_/g, ' ');
    };
    
	var createCollapsibleSection = function(ob, fnGetItems, heading){
        var accessibility =  new EuAccessibility(heading, fnGetItems);
        
        if(ob.hasClass('ugc-li')){
            ob.bind('keypress', accessibility.keyPress);
        }
        else{
            ob.Collapsible({
                "headingSelector" : "h3 a",
                "bodySelector"    : "ul",
                "keyHandler"      : accessibility
            });
        }
    };

    var setupQuery = function(){
        self.q = container.find('.jump-to-page:first #q');
      
        var submitCell          = container.find('.submit-cell');
        var submitCellButton    = container.find('button');
        var menuCell            = container.find('.menu-cell');
        var searchMenu          = container.find('#search-menu');

        // form size adjust
        submitCell.css("width", submitCellButton.outerWidth(true) + "px"); 
        menuCell.css("width", searchMenu.width() + "px");
        submitCellButton.css("border-left",    "solid 1px #4C7ECF");    // do this after the resize to stop 1px gap in FF

        // Disable forms and wire submission to ajax call
        
        
        container.find("form").submit(function() {
            doSearch();
            return false;
        });
        
        container.find("#refine-search-form").unbind('submit').submit(function() {
        	//alert('submit');
	        try{	
	        	var keyInput = $(this).find('#newKeyword');
	        	var keyword  = keyInput.val();
	        	
	        	keyInput.val('');
	        	if(keyword){
	        		keyInput.removeClass('error-border');    		
		     		$(this).append('<input type="hidden" name="qf" value="qf=' + keyword + '"/>');
	                doSearch();    
	        	}
	        	else{
	        		keyInput.addClass('error-border');
	        	}
	        }
	        catch(e){
	        	console.log(e);
	        }
            return false;
        });
    };

    var setupMenus = function(){
    	
        // result size 
        
    	var menuConfig = {
            "fn_init": function(self){
                self.setActive(paginationData.rows);
            },
            "fn_item":function(self, selected){
                doSearch(paginationData.start);
            }
        };
    	
        self.resMenu1 = new EuMenu( container.find(".nav-top .eu-menu"),	menuConfig);
        self.resMenu2 = new EuMenu( container.find(".nav-bottom .eu-menu"),	menuConfig);

        self.resMenu1.init();
        self.resMenu2.init();

        // menu closing
        $(container).click( function(){
        	container.find('.eu-menu' ).removeClass("active");
        });
    };

   
    
    
    
    self.init = function() {

        container = $('#content');
        
        $('body').append('<div class="ajax-overlay"></div>');
        $('.ajax-overlay').hide();
        
        itemTemplate       = container.find('.stories li:first');
        facetTemplate      = $(
        '<li>' + 
          '<h3><a rel="nofollow" class="facet-section icon-arrow-6" href=""></a></h3>' + 
          '<ul style="display: none;">' +
            '<li>' + 
              '<h4>' + 
                  '<input type="checkbox"><a><label><span class="fcount"></span></label></a>' + 
              '</h4>' + 
            '</li>' + 
          '</ul>' + 
        '</li>'
        );

        pagination = new EuPagination($('.result-pagination'),
        	{
        		"ajax":true,
        		"fns":{
            		"fnFirst":function(e){
            			e.preventDefault();
            			searchAjax.search(1);
            		},
					"fnPrevious":function(e){
						e.preventDefault();
						searchAjax.search(paginationData.start - paginationData.rows);
					},       			
            		"fnNext":function(e){
            			e.preventDefault();
            			searchAjax.search( parseInt(paginationData.start) + parseInt(paginationData.rows));
            		},
					"fnLast":function(e){
						e.preventDefault();
						searchAjax.search(pagination.getMaxStart());
					},
            		"fnSubmit":function(val){
						val = parseInt(val);
            			var start = ((val-1) * paginationData.rows) + 1;
            			searchAjax.search( start );            				
			            return false;
					}
        		},
        		data: paginationData
        	}
        );

        setupQuery();
        setupMenus();

        bindFacetLinks();
        bindFilterLinks();
        $(":checkbox").attr("autocomplete", "off");
    };

    
    return {
        "init" : function(data){ self.init();},
        "search" : function(startParam){ doSearch(startParam); },
        "showRes" : function(data){ showRes(data); },
        "setSearchUrlStem" : function(urlStem){
        	searchUrlStem = urlStem;
            facetless  = true; // next call only will be without facets
        }
    };
    
};



var searchAjax = EUSearchAjax();
searchAjax.init();

