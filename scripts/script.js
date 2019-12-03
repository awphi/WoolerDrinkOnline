const $root = $("#root")
const Controller = {
	gamemode: 0,
	players: {},
	categories: []
}

Controller.escapeRegExp = function(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
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

Controller.randomInt = function(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

Controller.addPlayer = function() {
	Unit.load("player", $("#player-view")).then((id) => {
		Controller.players[id] = {
			id: id,
			name: "Player",
			male: true,
			sips: 0,
			hearts: 2
		}

		const $elem = $("#player-view");
		$elem.scrollTop($elem[0].scrollHeight);

		if(Object.keys(Controller.players).length >= 2) {
			$("#player-set-up-done-button").attr("disabled", false)
		}
	})
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

	if(Object.keys(Controller.players).length < 2) {
		$("#player-set-up-done-button").attr("disabled", true)
	}
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
	for (var player in Controller.players) {
		Controller.players[player].name = $("playerunit[uid=" + player + "]").children("p").text()
	}

	if(Object.keys(Controller.players).length >= 2) {
		Controller.load('categories');
	}
}

Controller.playGame = function() {
	Controller.categories = []

	const c = $("categoryunit")
	for (var i = c.length - 1; i >= 0; i--) {
		const $ci = $(c[i])
		const checkbox = $ci.find("input[type='checkbox']")

		if(checkbox.is(':checked')) {
			Controller.categories.push($ci.find(".category-id").text())
		}
	}

	if(Controller.categories.length >= 1) {
		Controller.load("game");
	}
}

Controller.load("splash")

/*
Controller.load("game")

Controller.categories.push("dares_sexy")
Controller.players[0] = {
	name: "Adam",
	male: true,
	sips: 0,
	id: 0,
	hearts: 2
}

Controller.players[1] = {
	name: "Daniel",
	male: true,
	sips: 0,
	id: 1,
	hearts: 2
}*/
