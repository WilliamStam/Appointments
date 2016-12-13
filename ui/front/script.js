
/*
 ***** API for this request *****

 {{ url|raw }}

 ***** API for this request *****
*/

{% for key,value in get %}
var {{ key }} = "{{ value }}";
{% endfor %}

var SCRIPT = (function () {

	return function () { //Public function
		var default_options = {
			"debugging":false,			// to enable debugging. check console
			"advert":"", 				// advert ID either 123 or md5 of the ID
			"keywords":"",				// keywords the site wants to pass to ad-server
			"mustContain":"",			// adverts must contain these keywords
			"mustNotContain":"",		// adverts must NOT contain these keywords
			"onLoad":function(data){},		// function executed as the script is called
			"onAdvert":function(data,script){},	// function executed right after the adverts script has been called	(when an advert is found)
			"onEmpty":function(data){},		// function executed when no advert is found
			"onEnd":function(data){},		// function executed when the script has finished loading the advert and cleanup
		};
		var options = Object.assign(default_options,arguments[2]);
		debugging_function("ADVERT",options,"group");
		debugging_function("API: {{ url|raw }}",options,"info");
		debugging_function("SCRIPT: {{ url_script|raw }}",options,"info");

		debugging_function(options,options,"info");


		var _THIS = this;
		var siteKEY = arguments[0];
		var module = arguments[1];

		options.siteID = siteKEY;
		options.module = module;
		if (options.onLoad && typeof(options.onLoad) === "function") {
			debugging_function("onLoad",options,"group");
			options.onLoad.call(_THIS);
			debugging_function("onLoad",options,"groupEnd");
		}

		var data = {{ advert|raw }};

		if (data.advert && data.advert.ID) {
			debugging_function("ADVERT FOUND",options,"group");
			SHOW.call(_THIS, options, data);


			debugging_function("ADVERT FOUND",options,"groupEnd");
		} else {
			debugging_function("NO ADVERT FOUND",options,"group");
			if (options.onEmpty && typeof(options.onEmpty) === "function") {
				debugging_function("onEmpty",options,"group");

				options.onEmpty.call(_THIS,data);

				debugging_function("onEmpty",options,"groupEnd");

			}
			debugging_function("NO ADVERT FOUND",options,"groupEnd");
		}


		if (options.onEnd && typeof(options.onEnd) === "function") {
			debugging_function("onEnd",options,"group");

			options.onEnd.call(_THIS, data);

			debugging_function("onEnd",options,"groupEnd");
		}


		debugging_function("ADVERT",options,"groupEnd");
	}
})();
var timers = {};
function debugging_function(str,options,type){
	if (options.debugging){
		switch(type) {
			case "group":
				timers[str] = performance.now();
				console.group(str);
				break;
			case "groupEnd":

				if (timers[str]){
					var n = performance.now();
					console.log(str + ": "+ (n -timers[str]) );
				}

				console.groupEnd(str);
				break;
			case "error":
				console.error(str);
				break;
			case "info":
				console.info(str);
				break;
			default:
				console.log(str);
		}

	}

};
if (typeof Object.assign != 'function') {
	Object.assign = function (target, varArgs) { // .length of function is 2
		'use strict';
		if (target == null) { // TypeError if undefined or null
			throw new TypeError('Cannot convert undefined or null to object');
		}

		var to = Object(target);

		for (var index = 1; index < arguments.length; index++) {
			var nextSource = arguments[index];

			if (nextSource != null) { // Skip over if undefined or null
				for (var nextKey in nextSource) {
					// Avoid bugs when hasOwnProperty is shadowed
					if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
						to[nextKey] = nextSource[nextKey];
					}
				}
			}
		}
		return to;
	};
};
{{ script|raw }};