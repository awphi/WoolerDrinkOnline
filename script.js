const $root = $("#root")
const Controller = {}

Controller.startGame = function(mode) {
	if(mode === 1) {
		Controller.mode = 1
	} else {
		Controller.mode = 0
	}

	Controller.loadPlayerSelect()
}

Controller.load = function(view) {
	$.ajax({url: "./views/" + view + ".html", success: function(result){
		$("#root").html(result);
	}});
}

Controller.load("splash");
