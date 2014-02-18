var AccordionTab = function (elIn, parentIn, indexIn, fnDisabledClick) {
	var self          = this;
	self.a            = elIn;
	self.el           = elIn.next('.section');
	self.index        = indexIn;
	self.parent       = parentIn;

	var open = function () {
		
		var alreadyOpen = self.a.hasClass('active');
		
		self.parent.el.find('.tab-header').removeClass('active');
		self.parent.el.find('.section').removeClass('active');

		if(alreadyOpen && self.a.css('display')=='block'){ // only allow hide on mobile view
			self.parent.selectionMade(false, false, false);
		}
		else{
			self.a .addClass('active');
			self.el.addClass('active');
			self.parent.selectionMade(self.index, self.el.attr('id'), self.a.attr('href') );
		}
	};

	self.a.on('click', function (e) {
		e.preventDefault();

		if(self.parent.disabledTabs.length){
			if(self.parent.disabledTabs.indexOf(self.index)>-1){
				if(fnDisabledClick){
					fnDisabledClick();
				}
				return;
			}
		}
		open();
	});

	return {
		openTab : function (){
			//self.a.click();
			open();
		},
		getTabContent : function(){
			return self.el;
		},
		getTabOpener : function(){
			return self.a;
		}
	};
};
	

var AccordionTabs = function(elIn, callbackIn, hash, fnDisabledClick){
	var self		= this;
	var allTabs		= [];
	
	self.disabledTabs = [];
	self.el			 = elIn;
	self.activeId	 = '';
	self.activeIndex = '';
	self.activeHash	 = '';
	self.callback	 = callbackIn;
		
	self.el.addClass('accordion-tabs');
	self.selectionMade = function(index, id, hash){
		self.activeId      = id;
		self.activeIndex   = index;
		self.activeHash    = hash;
		
		if(self.callback){
			self.callback(index, id, hash);
		}

	};

	self.el.find('.tab-header').each(function (i, ob) {
		allTabs[allTabs.length] = new AccordionTab($(ob), self, i, fnDisabledClick);
	});
				
	self.openTab = function(hash){
			
		// programmatic open
		if(self.disabledTabs.indexOf(hash) == -1){
			if(hash != self.activeHash){
				self.el.find('.tab-header').each(function (i, ob) {
					ob = $(ob);
					if( ob.attr('href') == hash ){
						allTabs[i].openTab();
						return;
					}
				});					
			}				
		}
	};
	
	self.openTabAtIndex = function(i){
		if(allTabs[i]){
			allTabs[i].openTab();			
		}
		else{
			console.log("no such tab: " + i);
		}
	};
	
	
	if (allTabs.length>0) {
		setTimeout(function(){
			if(hash){
				self.openTab(hash);
			}
			else{
				self.openTabAtIndex(0);				
			}
		}, 1);
	}
	
	
	/* event debouncing () */
	(function($,sr){

		var debounce = function (func, threshold, execAsap) {
			var timeout;
			return function debounced () {
				var obj = this, args = arguments;
				function delayed () {
					if (!execAsap)
						func.apply(obj, args);
						timeout = null;
					};
		
					if (timeout){
						clearTimeout(timeout);
					}
					else if (execAsap){
						func.apply(obj, args);
					}
		
					timeout = setTimeout(delayed, threshold || 100);
				};
			};
	
			// smartresize 
			jQuery.fn[sr] = function(fn){	return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
			jQuery.fn['euScroll'] = function(fn){	return fn ? this.bind('scroll', debounce(fn)) : this.trigger(sr); };

	})(jQuery,'euRsz');

	
	var forceFit = function(){
				
		var origHeight     = self.el.height();	
		self.el.addClass('measure');
		
		var measureHeight  = self.el.height();
		self.el.removeClass('measure');
		
		if(measureHeight > origHeight){
			self.el.addClass('accordion');
		}
		else{
			self.el.removeClass('accordion');
		}
	};
	
	$(window).euRsz(function(){
		forceFit();
	});
	
	forceFit();
	
	
	/* end event debouncing */
	
		
	return {
		getOpenTabId : function () {
			return self.activeId;
		},
		getOpenTabIndex : function () {
			return self.activeIndex;
		},
		openTab : function(hash){
			console.log("exposed openTab");
			self.openTab(hash);
		},
		openTabAtIndex : function(i){
			self.openTabAtIndex(i);
		},
		setDisabledTabs : function(disabledTabs){	
			self.disabledTabs = disabledTabs;
			self.el.find('.tab-header').removeClass('disabled');
			$.each(disabledTabs, function(i, ob){
				$(self.el.find('.tab-header')[ob]).addClass('disabled');
			});
		},
		setCallback:function(callbackIn){
			self.callback	 = callbackIn;
		},
		getTabs : function(){
			return allTabs;
		}
	};
};
