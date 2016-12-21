



$(document).ready(function () {
	
	
	getForm();
	
	
	$(document).on("submit", "#form", function (e) {
		e.preventDefault();
		var $this = $(this);
		var data = $this.serializeArray();
		var ID =  $.bbq.getState("ID");
		
		
		$.post("/admin/save/notifications/form", data, function (result) {
			result = result.data;
			validationErrors(result, $this);
			if (!result.errors) {
				getForm();
			}
		})
		
	});
	

	





});

function getForm() {
	var ID =  $.bbq.getState("ID");
	
	$.getData("/admin/data/notifications/form", {"ID": ID}, function (data) {
		
		$("#whole-area").jqotesub($("#template-form"), data);



		intitCheckboxes();

		$(window).trigger("resize");
	},"form-data")
	
}

function intitCheckboxes(){

	$("#notification-table input[type='checkbox']").each(function(){
		var $this = $(this);
		if ($this.is(":checked")){
			$this.closest("td").addClass("active")
		} else {
			$this.closest("td").removeClass("active")
		}
	}).on("change",function(){
		intitCheckboxes()
	})
}