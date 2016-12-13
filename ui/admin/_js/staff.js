



$(document).ready(function () {
	
	
	getForm()
	getList()
	
	
	$(document).on("submit", "#form", function (e) {
		e.preventDefault();
		var $this = $(this);
		var data = $this.serializeArray();
		var ID =  $.bbq.getState("ID");
		
		
		$.post("/admin/save/staff/form?ID=" + ID, data, function (result) {
			result = result.data;
			validationErrors(result, $this);
			if (!result.errors) {
				getForm();
				getList();
			}
		})
		
	});
	
	$(document).on("click", "#btn-delete-record", function (e) {
		e.preventDefault();
		var ID =  $.bbq.getState("ID");
		if (confirm("Are you sure you want to delete this record?")){
			$.post("/admin/save/staff/delete?ID=" + ID, {}, function (result) {
				result = result.data;
				
				if (!result.errors) {
					toastr["success"]("Record Deleted", "Success");
					getForm();
					getList();
				} else {
					toastr["error"]("There was an error deleting this record", "Error");
				}
			})
		}
		
		
	});
	$(document).on("submit", "#filter-form", function (e) {
		e.preventDefault();
		var $this = $(this);
		$.bbq.pushState({"search":$("#search",$this).val()});
		getList()
		
	});
	$(document).on("click", "#btn-search-clear", function (e) {
		e.preventDefault();
		$.bbq.removeState("search")
		getList()
		
	});
	$(document).on("click", ".record[data-id]", function (e) {
		e.preventDefault();
		var ID = $(this).attr("data-id")
		$.bbq.pushState({"ID":ID})
		getForm()
		
	});
	
	
	
	
	
	$(window).on("scroll resize", function () {
		sideMenu()
	});
	
	
	
	sideMenu();
	
	$.doTimeout(4000,function(){
		//$("#side-bar").trigger("offcanvas.open");
	})
	
});
function highlightCurrent(){
	var ID =  $.bbq.getState("ID");
	
	$(".record[data-id].active").removeClass("active")
	if (ID){
		$(".record[data-id='"+ID+"']").addClass("active")
	}
	
	
}
function getForm() {
	var ID =  $.bbq.getState("ID");
	
	$.getData("/admin/data/staff/form", {"ID": ID}, function (data) {
		
		$("#left-area").jqotesub($("#template-form"), data);
		
		highlightCurrent();
		
		$(window).trigger("resize");
	},"form-data")
	
}
function getList() {
	var ID =  $.bbq.getState("ID");
	var search =  $.bbq.getState("search");
	
	$.getData("/admin/data/staff/_list", {"ID": ID, "search": search}, function (data) {
		
		$("#right-list-records").jqotesub($("#template-list"), data);
		
		
		highlightCurrent();
		
		$(window).trigger("resize");
	},"list-data")
	
}

function sideMenu() {
	var $rightArea = $("#right-area");
	var $sideBar = $("#side-bar");
	var $sideBarBody = $("#side-bar-body");

	var w = $rightArea.width();

	var scroll = $(window).scrollTop();





	if ($(window).width()>768){
		$rightArea.addClass("fixed");


		var content_start_top =  $("#content-start").offset()['top'];

		var fixed_navbars_height = $("#main-nav-bar").outerHeight();
		if ($("#toolbar").outerHeight()) fixed_navbars_height = fixed_navbars_height + $("#toolbar").outerHeight();

		var top_minus_scroll = content_start_top - scroll;
		var top = (top_minus_scroll<fixed_navbars_height)?fixed_navbars_height:top_minus_scroll;





		$(".fixed #side-bar").css({width: w, bottom: 0, "top": top, "position": "fixed"});


	} else {
		$rightArea.removeClass("fixed");



		$("#side-bar").swipe( {
			swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
				if ($(window).width()<768){
					console.log(direction)
					if (direction=="right"){
						$("#side-bar").find(".offcanvas").trigger("offcanvas.close");
					}
					if (direction=="left"){
						$("#side-bar").find(".offcanvas").trigger("offcanvas.open");
					}

				}

			},
			threshold: 75,
			allowPageScroll: "auto"
		}).removeProp("style");


	}




}