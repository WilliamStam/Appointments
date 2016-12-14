
$(document).ready(function () {

	$(document).on("change", "#toolbar input[name='view']", function () {
		getData();
	});
	$(document).on("submit", "#search-form", function (e) {
		e.preventDefault();
		getData();
	});



	$(document).on("hide.bs.modal","#modal-window",function(){
		getData()


	});



	getData();

});
function getData() {

	var search = $("#search").val();


	var section = $("#toolbar input[name='view']:checked").val();
	if (!section.indexOf("list", "day", "calendar")) section = "list";


	$.getData("/admin/data/home/view_" + section, {"section": section, "search": search}, function (data) {


		$("#content-area").jqotesub($("#template-view-" + section), data);
		$("#header-area").jqotesub($("#template-header"), data.head);
		$("#header-agenda-area").jqotesub($("#template-header-agenda"), data.head);


		$('*[data-toggle="popover"]').popover()
		$('*[data-toggle="tooltip"]').tooltip()




	}, "data")


}

