



$(document).ready(function () {
	
	
	getForm();
	
	
	$(document).on("submit", "#form-notification-area", function (e) {
		e.preventDefault();
		var $this = $(this);
		var data = $this.serializeArray();
		var ID =  $.bbq.getState("ID");
		
		
		$.post("/admin/save/notification_templates/template", data, function (result) {
			result = result.data;
			validationErrors(result, $this);
			if (!result.errors) {
				$("#modal-window").modal("hide");
			}
		})
		
	});
	

	$(document).on("click",".edit-notification-template",function(e){
		e.preventDefault();
		var $this = $(this);
		var id = $this.attr("data-id");
		$.bbq.pushState({"notification":id})


		getModal();



	});

	if ($.bbq.getState("notification")) getModal();





});
function getModal(){

	var ID =  $.bbq.getState("notification");

	$.getData("/admin/data/notification_templates/template", {"ID": ID}, function (data) {

		$("#modal-window").jqotesub($("#template-form-"+data.notification.type), data).modal("show").on("hide.bs.modal",function(){
			$.bbq.pushState({"notification":""})
		});


	}, "data-notification-template")
}

function getForm() {
	var ID =  $.bbq.getState("ID");
	
	$.getData("/admin/data/notification_templates/form", {"ID": ID}, function (data) {
		
		$("#whole-area").jqotesub($("#template-form"), data);





		$(window).trigger("resize");
	},"form-data")
	
}
