
var ajaxRequests = 0;

function ajaxRequestLoading(){
	if (ajaxRequests>0){
		$('#loadingmask').stop(true,true).fadeIn(10);
	} else {
		$('#loadingmask').stop(true,true).fadeOut(500);
	}
	
}


window.onerror = function() {
	$('#loadingmask').stop(true,true).fadeOut(500);
}


$(document).ajaxSend(function(event, request, settings) {
	
	if (settings.url.indexOf("hiddenajax")!=-1){
		
	} else {
		ajaxRequests = ajaxRequests+1;
		ajaxRequestLoading();
	}
	
});

$(document).ajaxComplete(function(event, request, settings) {
	if (settings.url.indexOf("hiddenajax")!=-1){
		
	} else {
		ajaxRequests = ajaxRequests-1;
		ajaxRequestLoading();
	}
	
});



;$(document).ready(function () {
	
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="popover"]').popover();
	
	
	//$('#loadingmask').stop(true,true).fadeOut(500);
	
	$( document ).ajaxError(function( event, jqxhr, settings, thrownError) {
		//console.log(settings.url.indexOf("true"))
		if (jqxhr.status == 403) {
			alert("Sorry, your session has expired. Please login again to continue");
			window.location.href ="/login";
		} else if (thrownError === 'abort') {
		} else if (settings.url.indexOf("hiddenajax")!=-1) {
			
		} else {
			alert("An error occurred: " + jqxhr.status + "\nError: " + thrownError);
		}
	});
	
	
	
	
	
	$(document).on('click', '.btn-row-details', function (e) {
		var $this = $(this), $table = $this.closest("table");
		var $clicked = $(e.target).closest("tr.btn-row-details");
		var active = true;

		if ($this.hasClass("active") && $clicked) active = false;

		$("tr.btn-row-details.active", $table).removeClass("active");
		if (active) {
			$this.addClass("active");
		}

		var show = $("tr.btn-row-details.active", $table).nextAll("tr.row-details");

		$("tr.row-details", $table).hide();
		if (show.length) {
			show = show[0];
			$(show).show();
		}

	});

	

	

	
	
});





function updatetimerlist(d, page_size) {
	//d = jQuery.parseJSON(d);
	if (!d || !typeof d == 'object') {
		return false;
	}
	//console.log(d);
	var data = d['timer'];
	var page = d['page'];
	var models = d['models'];
	var menu = d['menu'];




	if (data) {
		
		var highlight = "";
		if (page['time'] > 0.5)    highlight = 'style="color: red;"';

		var th = '<tr class="heading" style="background-color: #fdf5ce;"><td >' + page['page'] + '</td><td class="s g"' + highlight + '>' + page['time'] + '</td></tr>';
		var thm = "";
		if (models) {
			thm = $("#template-timers-tr-models").jqote(models);
		} 
		//console.log(thm)
		var timers = $("#template-timers-tr").jqote(data);
		//console.log(timers)

		//console.log($("#template-timers-tr"))
		//console.log(thm)
		
		$("#systemTimers").prepend(th + timers + thm);
		
		
		
		
		
	}
	
	

};


function uniqueid(){
	// always start with a letter (for DOM friendlyness)
	var idstr=String.fromCharCode(Math.floor((Math.random()*25)+65));
	do {
		// between numbers and characters (48 is 0 and 90 is Z (42-48 = 90)
		var ascicode=Math.floor((Math.random()*42)+48);
		if (ascicode<58 || ascicode>64){
			// exclude all chars between : (58) and @ (64)
			idstr+=String.fromCharCode(ascicode);
		}
	} while (idstr.length<12);
	
	idstr = idstr + (new Date()).getTime();
	return (idstr);
}
function minutes_to_time(inputSeconds,format){
	return seconds_to_time(inputSeconds*60,format);
}
function seconds_to_time(inputSeconds,format){
	var secondsInAMinute = 60;
	var secondsInAnHour  = 60 * secondsInAMinute;
	var secondsInADay    = 24 * secondsInAnHour;

	// extract days
	var days = Math.floor(inputSeconds / secondsInADay);

	// extract hours
	var hourSeconds = inputSeconds % secondsInADay;
	var hours = Math.floor(hourSeconds / secondsInAnHour);

	// extract minutes
	var minuteSeconds = hourSeconds % secondsInAnHour;
	var minutes = Math.floor(minuteSeconds / secondsInAMinute);

	// extract the remaining seconds
	var remainingSeconds = minuteSeconds % secondsInAMinute;
	var seconds = Math.ceil(remainingSeconds);

	// return the final array
	var obj = {
		'd' : days,
		'h' : hours,
		'm' : minutes,
		's' : seconds
	};

	var ret = obj;
	if (format){
		ret = "";
		ret += (obj["d"])?obj["d"]+"d ":"";
		ret += (obj["h"])?obj["h"]+"h ":"";
		ret += (obj["m"])?obj["m"]+"m ":"";
		ret += (obj["s"])?obj["s"]+"s ":"";
		ret.trim();
	}
	return ret;
}