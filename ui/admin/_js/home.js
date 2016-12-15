
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

		pushy["list_value_"+$this.attr("data-section")] = $this.attr("data-value");
		pushy["list_filter"] = $this.attr("data-section");
		$.bbq.pushState(pushy);

		getData();

	});
	$(document).on("change","#filter-bar input[name='filter']",function(e){
		e.preventDefault();
		var $this = $(this);

		var pushy = {};
		pushy["list_filter"] = $("#filter-bar input[name='filter']:checked").val();
		$.bbq.pushState(pushy);

		getData();

	});



	getData();

});
function getData() {

	var search = $("#search").val();


	var section = $("#toolbar input[name='view']:checked").val();
	if (!section || !section.indexOf("list", "day", "calendar")) section = "list";

	var params =  {"section": section, "search": search, "list_filter":$.bbq.getState("list_filter")};
	switch(section){
		case "list":

			switch(params['list_filter']){
				case "day":
					params["list_value"] = $.bbq.getState("list_value_day");
					break
				case "week":
					params["list_value"] = $.bbq.getState("list_value_week");
					break;
				case "month":
					params["list_value"] = $.bbq.getState("list_value_month");
					break;

			}



			break;

	}


	$.getData("/admin/data/home/view_" + section,params, function (data) {


		$("#content-area").jqotesub($("#template-view-" + section), data);
		$("#header-area").jqotesub($("#template-header"), data.head);
		$("#header-agenda-area").jqotesub($("#template-header-agenda"), data.head);

		if (data.settings.search){
			$("#search-form button[type='reset']").show();
		} else {
			$("#search-form button[type='reset']").hide();
		}


		$('*[data-toggle="popover"]').popover()
		$('*[data-toggle="tooltip"]').tooltip()




	}, "data")


}

