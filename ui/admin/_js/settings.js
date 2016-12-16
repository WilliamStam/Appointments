



$(document).ready(function () {
	
	
	getForm();
	
	
	$(document).on("submit", "#form", function (e) {
		e.preventDefault();
		var $this = $(this);
		var data = $this.serializeArray();
		var ID =  $.bbq.getState("ID");
		
		
		$.post("/admin/save/settings/form", data, function (result) {
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
	
	$.getData("/admin/data/settings/form", {"ID": ID}, function (data) {
		
		$("#whole-area").jqotesub($("#template-form"), data);

		initOpenHours();

		initDaysOfYear();



		$(window).trigger("resize");
	},"form-data")
	
}

function initOpenHours(){
	$('.time-input').clockpicker({
		placement: 'bottom',
		align: 'left',
		donetext: 'Done',
		autoclose: true,
		'default': 'now'
	}).on("change",function(){
		disabledEndHours();
	});
	$(".time-start").on("change",function(){
		var $te = $(this).closest(".time-row").find(".time-end")
		if ($te.val()==""){ $te.trigger("click"); }
	})
	disabledEndHours();


}
function disabledEndHours(){
	$(".time-row").each(function(){
		if ($(".time-start",$(this)).val()!==""){
			$(".time-end",$(this)).removeAttr("disabled")

		} else {
			$(".time-end",$(this)).attr("disabled","disabled")
		}
	})

}

function initDaysOfYear(){

	$(".day-checkbox").each(function(){
		var $this = $(this);
		if ($this.is(":checked")){
			$this.closest(".day-view").addClass("active")
		} else {
			$this.closest(".day-view").removeClass("active")
		}
	}).on("change",function(){
		initDaysOfYear()
	})
}