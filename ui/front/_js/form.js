var datetimepickerOptions = {
	inline: true,
	sideBySide: false,
	format: "YYYY-MM-DD",



icons: {
		time: "fa fa-clock-o",
		date: "fa fa-calendar",
		up: "fa fa-arrow-up",
		down: "fa fa-arrow-down",

		previous: 'fa fa-chevron-left',
		next: 'fa fa-chevron-right',
		today: 'fa fa-screenshot',
		clear: 'fa fa-trash',
		close: 'fa fa-remove'
	}
};


$(document).ready(function () {
	var currenttab = $.bbq.getState("tab")||"tab1";

	//console.log("bbq.getState:"+currenttab);

	$('#wizard-tabs a[href="#'+currenttab+'"]').tab('show')
	$('#rootwizard').bootstrapWizard({
		'show':currenttab,
		'tabClass': 'nav nav-pills',
		'nextSelector': '.button-next',
		'previousSelector': '.button-previous',
		'firstSelector': '.button-first',
		'lastSelector': '.button-last',
		'onTabShow':function(tab, navigation, index){
			var tabid = $(tab).find("a").attr("href").replace("#","")
			$.bbq.pushState({"tab":tabid});
		//	console.log("bbq.pushState:"+tabid);

			if (tabid=="tab-confirm"){
				$('#form-footer-other').find("button[type='submit']").attr("disabled","disabled");
				$("#form-footer-confirm").show();
				$("#form-footer-other").hide();

			} else {
				$('#form-footer-other').find("button[type='submit']").removeAttr("disabled");
				$("#form-footer-confirm").hide();
				$("#form-footer-other").show();
			}


			getSteps()
		},

	});

	$(document).on("submit","#rootwizard",function(e){
		e.preventDefault();
		$('#rootwizard').bootstrapWizard('next');

	});
	$(document).on("reset","#rootwizard",function(e){
		$(':input','#rootwizard')
			.not(':button, :submit, :reset, :hidden')
			.val('')
			.removeAttr('checked')
			.removeAttr('selected');

		console.log("clear all")

		$('#rootwizard')[0].reset();

		window.location = "/form"


	});




	$(document).on("change","input[name='appointmentDate_day']",function(){
		appointmentdayhighlight();
		$('#rootwizard').bootstrapWizard('next');

	})

	$(document).on("change","input[name='appointmentDate_time']",function(){
		appointmenttimehighlight();
		$('#rootwizard').bootstrapWizard('next');

	})

	$(document).on("change","input[name='services[]']",function(){
		serviceshighlight()


	})

	$(document).on("click","#form-footer-confirm .btn.btn-primary",function(){

		var data = $("#confirm-form-area-form").serialize();
		data = data + "&submit[notes]="+$("#notes").val();

		console.log(data)
		console.log($("#notes").val())

		$.post("/save/form/form",data,function(data){
			var data = data.data;
			if (data.errors){

				alert("There were errors submitting your booking")
			} else {
				$("#modal-window").jqotesub($("#template-booking-successful"), data).modal("show").on("hide.bs.modal",function(){
		//			$('#rootwizard').bootstrapWizard('first');
					//$(window).close();
					$('#rootwizard').trigger("reset");


				});
			}

		})




	})




	resize();

	$(window).on("resize",function(){
		resize();
	});



});
function appointmentdayhighlight(){
	$("#appointmentDate_day li.active").removeClass("active")
	$("input[name='appointmentDate_day']").each(function(){
		if ($(this).is(":checked")){
			$(this).closest("li").addClass("active")
		}
	})
}
function appointmenttimehighlight(){
	$("#appointmentDate_time li.active").removeClass("active")
	$("input[name='appointmentDate_time']").each(function(){
		if ($(this).is(":checked")){
			$(this).closest("li").addClass("active")
		}
	})


}
function serviceshighlight(){

	$(".panel-service label.active").removeClass("active")

	$("input[name='services[]']").each(function(){
		if ($(this).is(":checked")){
			$(this).closest("label").addClass("active")
		}
	});


	var duration = 0;
	var count = 0;
	var $label_area = $("#services-selected");
	$("#services  label.active").each(function(){
		var $this = $(this);
		duration = duration + $this.attr("data-duration")*1;
		count = count + 1;

	})

	$("#duration").val(duration);

	duration = minutes_to_time(duration,true);

	if (count){
		var lable = '';
		lable += '<div class="row">';
		lable += '	<div class="col-sm-6">';
		lable += '		<span class="ser-foot-heading count">Services </span>';
		lable += '		<span class="ser-foot-value count">'+count+'</span>'
		lable += '	</div>';
		lable += '	<div class="col-sm-6">';
		lable += '		<span class="ser-foot-heading duration">Duration</span>';
		lable += '		<span class="ser-foot-value duration">'+duration+'</span>';
		lable += '	</div>';
		lable += '</div>';

		$("#services-selected").html(lable);
	} else {
		$("#services-selected").html("");
	}




}
function getSteps(){
var $form = $("#rootwizard")
	var data = $form.serialize();
	var currenttab = $.bbq.getState("tab")||0;

	$.post("/data/form/data?tab="+currenttab,data,function(data){
		data = data.data;
		$("#form-tabs .tab-pane").each(function(){
			var $this = $(this);
			if ($this.attr("data-form")){
				$this.jqotesub($("#template-"+$this.attr("data-form")), data);
			}
		});

		$("#confirm-form-area-form").jqotesub($("#template-confirm-form-confirm"), data);


		appointmentdayhighlight();
		appointmenttimehighlight();
		serviceshighlight();

		var $capturebtn = $("#form-footer-confirm").find(".btn").removeClass("btn-danger").addClass("btn-primary").removeAttr("disabled");
		if (data.errors){
			var tabs = {};



			var i = 0;
			//console.log(data.errors);
			$(".form-validation", $form).remove();
			$.each(data.errors, function (k, v) {
				i = i + 1;
				var $field = $("#" + k);
				//console.info(k)
				var $block = $field.closest(".form-group");

				$block.addClass("has-error");
				if ($field.parent().hasClass("input-group")) $field = $field.parent();


				if (v != "") {

					$field.after('<span class="help-block s form-validation">' + v + '</span>');
				}
				if ($block.hasClass("has-feedback")) {
					$field.after('<span class="fa fa-times form-control-feedback form-validation" aria-hidden="true"></span>')
				}


				$field.each(function(){
					//console.log($(this))
					var tab = $(this).closest(".tab-pane").attr("id");
					if (typeof tabs[tab] == "undefined") {
						tabs[tab] = 0;
					}
					tabs[tab] = (tabs[tab]) + 1;
				})



			});

			if (i!=0){
				$capturebtn.addClass("btn-danger").removeClass("btn-primary").attr("disabled","disabled")
			}

//console.info(tabs);
			$("#wizard-tabs a").each(function(){
				var $this = $(this);
				var id = $this.attr("href").replace("#","");
				if (typeof tabs[id] != "undefined") {
					//console.log(id+" | "+tabs[id])


					$this.find(".badge").html('<i class="fa fa-exclamation"></i>');
				} else {
					$this.find(".badge").html('');
				}

			});

			$('textarea#notes').summernote({
				minHeight:200,
				toolbar: [
					['headline', ['style']],
					['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
					['textsize', ['fontsize']],
					['alignment', ['ul', 'ol', 'paragraph', 'lineheight']]
				]
			});



		}

		resize()
	})
}
function resize() {


	$(".panel-fixed").each(function () {
		var $this = $(this);
		var h = $this.find("> .panel-heading").outerHeight();
		var f = $this.find("> .panel-footer").outerHeight();
		var $body = $this.find("> .panel-body");
		$body.css({top: h, bottom: f});


	});
}