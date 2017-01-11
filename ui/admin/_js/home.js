
$(document).ready(function () {

	$(document).on("change", "#toolbar input[name='view']", function () {
		getData();
	});
	$(document).on("submit", "#search-form", function (e) {
		e.preventDefault();
		getData();
	});

	$(document).on("reset", "#search-form", function (e) {
		e.preventDefault();
		$("#search").val("");
		getData();
	});



	$(document).on("hide.bs.modal","#modal-window",function(){
		getData()


	});

	$(document).on("click",".section-list-jump",function(e){
		e.preventDefault();
		var $this = $(this);

		var pushy = {};

		pushy[$this.attr("data-section")+"_value"] = $this.attr("data-value");
		pushy["list_view"] = $this.attr("data-section");
		$.bbq.pushState(pushy);

		getData();

	});
	$(document).on("change","#filter-bar input[name='filter']",function(e){
		e.preventDefault();
		var $this = $(this);

		var pushy = {};
		pushy["list_view"] = $("#filter-bar input[name='filter']:checked").val();
		$.bbq.pushState(pushy);

		getData();

	});



	getData();

});
function getData() {

	var search = $("#search").val();


	var section = $("#toolbar input[name='view']:checked").val();
	if (!section || !section.indexOf("list", "day", "calendar")) section = "list";

	var list_view = $.bbq.getState("list_view");

	var params =  {"section": section, "search": search, "list_view":list_view};
	switch(section){
		case "list":

			switch(params['list_view']){
				case "day":
					params["day_value"] = $.bbq.getState("day_value");
					break
				case "week":
					params["week_value"] = $.bbq.getState("week_value");
					break;
				case "month":
					params["month_value"] = $.bbq.getState("month_value");
					break;
				default:
					params["day_value"] = "";
					break;

			}
			break;
		case "day":

			switch(params['list_view']){
				case "day":
					params["day_value"] = $.bbq.getState("day_value");
					break
				default:
					params["day_value"] = "";
					break;

			}



			break;
		case "calendar":

		switch(params['list_view']){
			case "month":
				params["month_value"] = $.bbq.getState("month_value");
				break;
			default:
				params["month_value"] = "";
				break;
		}
		break;

	}


	$.getData("/admin/data/home/data",params, function (data) {


		$("#content-area").jqotesub($("#template-view-" + section), data);
		$("#header-area").jqotesub($("#template-header"), data.head);
		$("#header-agenda-area").jqotesub($("#template-header-agenda"), data.head);

		if (data.settings.search){
			$("#search-form button[type='reset']").show();
		} else {
			$("#search-form button[type='reset']").hide();
		}

		if (section=="calendar"){
			$('#calendar-area').fullCalendar({
				header:false,
				eventLimit: true,
				defaultDate: data.list.settings.start+" 00:00:00",
				eventSources: [
					{events: data.list.items},

				],
				dayRender: function (date, cell) {
					//console.log(date.format("Y-MM-DD"))

					var dateKey = date.format("Y-MM-DD");

					//console.log(dateKey+" | "+data.list.closed.indexOf(dateKey))

					if (data.list.closed.indexOf(dateKey)!=-1){
						cell.addClass("disabled");
					}


				},
				eventClick: function(event) {
					if (event.ID) {

						var ID = event.ID;
						if (ID){
							$.bbq.pushState({"appID":ID});
							getAppointmentView()
						}


						return false;
					}
				}
			});

			//console.log(data.list.settings.start)
			//$('#calendar-area').fullCalendar('gotoDate', data.list.settings.start+" 00:00:00");

		}


		$('*[data-toggle="popover"]').popover()
		$('*[data-toggle="tooltip"]').tooltip()




	}, "data")


}

