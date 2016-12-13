/*********** for the switch the current advert depending on screen width **********/
var categoryID = 1; // the website version
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0); // get the window width
if (w < 400){
	categoryID = 11 // if the window width is less than 400 pixels it changes the category ID to 11
} 

				
		!(function(catID){
			var scriptNode   = document.createElement('script');
			var thisObject = {};
			var PARAMS = arguments;
			scriptNode.onload = function() {
				if (typeof ADS == "function") {
					ADS.apply(this, PARAMS);
				}
			};
			scriptNode.src   = "//ad-server.co.za/script?catID="+catID;
			scriptNode.async = true;
			document.scripts[ document.scripts.length - 1 ].parentNode.appendChild( scriptNode );
		})(categoryID,{ });



/*********** only show this block if the width is < 400  **********/
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0); // get the window width
if (w < 400){
	!(function(catID){
		var scriptNode   = document.createElement('script');
		var thisObject = {};
		var PARAMS = arguments;
		scriptNode.onload = function() {
			if (typeof ADS == "function") {
				ADS.apply(this, PARAMS);
			}
		};
		scriptNode.src   = "//ad-server.co.za/script?catID="+catID;
		scriptNode.async = true;
		document.scripts[ document.scripts.length - 1 ].parentNode.appendChild( scriptNode );
	})(11,{ });
	
}