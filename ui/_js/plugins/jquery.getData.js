;(function ($) {
	var namespaces = {};
	jQuery.extend({
		getData: function (url, data, callback, namespace) {
			if (namespaces[namespace]) {
				for (var i = 0; i < namespaces[namespace].length; i++) namespaces[namespace][i].abort();
			} else {
				namespaces[namespace] = [];
			}
			var method = "get";
			var type = "json";


			if (jQuery.isFunction(data)) {
				type = type || callback;
				callback = data;
				data = undefined;
			}



			return namespaces[namespace].push(jQuery.ajax({
				url     : url,
				type    : method,
				dataType: type,
				data    : data,
				success : function(response, status, request){

					var d = request.responseJSON;



					if (d['reroute']) {
						window.location = d['reroute'];
						return false;
					}

					var page_size = request.getResponseHeader('Content-Length');

					page_size = (page_size) ? page_size : "";

					if (url == "/data/keepalive") {
					} else {
						updatetimerlist(d, page_size);
					}
					if (d['data']){
						d = d['data'];
					}
					
					
					callback(d);


				}
			}));
			//return jQuery.get(url, data, callback, "json");
		}

	});

})(jQuery);

