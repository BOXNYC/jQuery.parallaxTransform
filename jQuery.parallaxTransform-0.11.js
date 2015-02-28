/**
	* parallaxTransform jQuery Plugin v0.11
	* Author:
	* 	Joseph Weitzel
	*	joe@box.biz BOX Creative SoHo NYC
	* $().parallaxTransform(options)
	* 	@options (object) :
	* 		@percentZoom (integer) : 
	* 			Percent (0-100)% ammount of scale and transulation
	* 			of element's transform. Default 20%.
	* 		@process (function) : 
	* 			Method that allows the alterization of the translateY
	* 			value. This can provide an option to adjust the value
	* 			or clamp it. If returned false, the element it attains
	* 			to will not be applied with the CSS transform.
	* 		@extentions (array) : 
	* 			List of extentions for browsers not fully supporting
	* 			CSS3 transform's translate3d and scale functions.
	* 		@parentCSS (object) : 
	* 			CSS attributes to be applied to each elements parent.
	* 			Defaults to { overflow: 'hidden', display: 'block' }.
	* 		@scrollElement (DOM element or string selector) : 
	* 			jQuery selector for the element used for the scroll 
	* 			listener event. Default is document element.
	* 		@scrollContainer (DOM element or string selector) : 
	* 			jQuery selector for the element used to specify a 
	* 			scrollable height. Default is window element.
	* 		@updateOnImgLoad (boolean) : 
	* 			If set to true and each selector is an image, then
	* 			when each image load event occurs, parallax is updated.
	* 			Default is true.
	* 		@checkScrollable (boolean) : 
	* 			If set to true and an item's height is less than
	* 			the scrollContainer's height, then transformation CSS
	* 			is removed. Default is true.
	* 		@setTransform (boolean) : 
	* 			If set to true, CSS transforms will occur automatically.
	* 			This is only usefull when wanting to set your action using
	* 			the data supplied per element when binding on the custom
	* 			"parallaxTransform" event that is triggered per item.
	* 			Defaults to true.
	*/
(function($){
	$.fn.parallaxTransform = function(options){
		// Check to be sure 3D transform is supported
		var $items = $(this),
				supports3D = (function() {
			    if(!window.getComputedStyle) return false;
			    var el = document.createElement('p'),
									 has3d,
									 transforms = {
										 'webkitTransform': '-webkit-transform',
										 'OTransform': '-o-transform',
										 'msTransform': '-ms-transform',
										 'MozTransform': '-moz-transform',
										 'transform': 'transform'
									 };
			    document.body.insertBefore(el, null);
			    for(var t in transforms) {
		        if(el.style[t] === undefined) continue;
		        el.style[t] = "translate3d(1px,1px,1px)";
		        has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
			    };
					document.body.removeChild(el);
					return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
				}());
		if(!supports3D) return $items;
		// Option defaults
		options = $.extend({
			percentZoom: 20,
			process: false,
			extentions: ['moz','webkit','ms','o'],
			parentCSS: {
				overflow: 'hidden',
				display: 'block'
			},
			scrollElement: document,
			scrollContainer: window,
			updateOnImgLoad: true,
			checkScrollable: true,
			setTransform: true
		}, options);
		// Global vars
		var $scrollElement = $(options.scrollElement),
				$scrollContainer = $(options.scrollContainer),
				halfWindowHeight = 0,
				perDec = options.percentZoom / 100,
				halfPercZoom = options.percentZoom / 2,
				scale = perDec + 1,
				items = [];
		// On window resize and init, update vars...
		$scrollContainer.on('resize', function(){
			halfWindowHeight = $scrollContainer.height() / 2;
			items = [];
			$items.each(function(){
			  var $item = $(this),
					  $itemParent = $item.parent().css(options.parentCSS),
					  halfHeight = $itemParent.outerHeight()/ 2,
					  y = $itemParent.offset().top;
			  items.push({
				  y: y,
				  halfHeight: halfHeight,
				  $item: $item
			  });
			});
			$scrollElement.trigger('scroll');
		}).trigger('resize');
		// On scroll figure math scroll percentages,
		// and set css to items... 
		$scrollElement.on('scroll', function(){
			var scroll = $scrollElement.scrollTop();
			$.each(items, function(index, item){
				var itemY = ((item.y + item.halfHeight) - (scroll + halfWindowHeight)),
						scrollHeight = item.halfHeight - halfWindowHeight,
						scrollPercent = itemY/scrollHeight,
						Y = scrollPercent * halfPercZoom;
				if(typeof options.process === 'function') {
					var returned = options.process(Y, item);
					if(returned === false) return false;
					Y = returned;
				};
				if(options.checkScrollable && halfWindowHeight <= item.halfHeight) {
					item.$item.css('transform', '');
					for(var ei in options.extentions)
						item.$item.css('-'+options.extentions[ei]+'-transform', '');
					return true;
				};
				var css = {
					transform: 'translate3d(0,'+Y+'%,0) scale('+scale+')'
				};
				for(var ei in options.extentions)
					css['-'+options.extentions[ei]+'-transform'] = css.transform;
				if(options.setTransform) item.$item.css(css);
				item.$item.trigger('parallaxTransform', {
					css: css,
					translateY: Y,
					scale: scale,
					scrollPercent: scrollPercent,
					index: index
				});
			});
		}).trigger('scroll');
		// If each $item is an img, then lets refresh on loads
		if(options.updateOnImgLoad) $items.each(function(){
			var $item = $(this);
			if(!$item.is('img')) return true;
			$item.load(function(){
				$scrollContainer.trigger('resize');
			});
		});
		// Pass on jQuery object
		return $items;
	};
}(jQuery));
