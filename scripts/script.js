const $root = $("#root")

const Controller = {
	gamemode: 0,
	players: {},
	categories: []
}

Controller.startGame = function(mode) {
	if(mode === 1) {
		Controller.gamemode = 1
	}

	Controller.load("player-setup")
}

Controller.load = function(view) {
	$.ajax({url: "./views/" + view + ".html", success: function(result){
		$root.html(result);
	}});
}

Controller.addPlayer = function() {
	Unit.load("player", $("#player-view")).then((id) =>
		Controller.players[id] = {
			id: id,
			name: "Player",
			male: true
		}
	)
}

Controller.resolvePlayerByElem = function(elem) {
	const el = $(elem).parent().parent();
	const uid = el.attr("uid");

	return {
		unit: el,
		id: Number(uid)
	}
}

Controller.removePlayer = function(id) {
	delete Controller.players[id]
}

Controller.removePlayerByElem = function(elem) {
	const resolve = Controller.resolvePlayerByElem(elem)
	Controller.removePlayer(resolve.id)
	resolve.unit.remove()
}

Controller.swapGender = function(id) {
	Controller.players[id].male = !Controller.players[id].male
	return Controller.players[id].male
}

Controller.swapGenderByElem = function(elem) {
	const resolve = Controller.resolvePlayerByElem(elem)
	const male = Controller.swapGender(resolve.id)
	$(elem).text(male ? "Male" : "Female")
}

Controller.chooseCategories = function() {
	const c = $("playerunit")
	for (var i = c.length - 1; i >= 0; i--) {
		var id = Number($(c).attr("uid"));

	}

	for (var player in Controller.players) {
		Controller.players[player].name = $("playerunit[uid=" + player + "]").children("p").text()
	}

	if(Object.keys(Controller.players).length >= 2) {
		Controller.load('categories');
	}
}

//Controller.load("splash");
Controller.load("player-setup");