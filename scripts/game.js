const Game = {
	playerKeyIndex: 0,
	playerKeys: Object.keys(Controller.players),
	activePlayer: null,
	randomizer: {

	},
	weightsum: 0,
	taskbank: {}
}


Game.randomInt = function(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

Game.generateRandomizer = function() {
	Game.randomizer = {}
	var t = 0
	for (var i = Controller.categories.length - 1; i >= 0; i--) {
		var e = Controller.categories[i]
		Game.randomizer[e] = {}
		Game.randomizer[e].lower = t
		Game.randomizer[e].upper = t + (Categories.raw[e].weight - 1)
		t += Categories.raw[e].weight
	}

	Game.weightsum = t
}

Game.calculateSips = function(sipsIn) {
	return Controller.calculateSips(sipsIn, 0)
}

Game.calculateSips = function(sipsIn, penalty) {
	const y = (2.5 + (penalty / 3)) * (100 / (sipsIn + 40))
	return taskCoefficient * Math.round(y)
}

Game.compileTasks = function() {
	Game.taskbank = {}
	for (var i = Controller.categories.length - 1; i >= 0; i--) {
		const e = Controller.categories[i]
		if(!Categories.raw[e].hasOwnProperty("handler")) {
			$.ajax({url: "./data/" + e + ".json"}).then((result) => {
				Game.taskbank[e] = result
			})
		}
	}
}

Game.pickCategory = function() {
	const r = Game.randomInt(0, Game.weightsum - 1)
	for(var id in Game.randomizer) {
		var e = Game.randomizer[id]

		if(r >= e.lower && r <= e.upper) {
			return id
		}
	}
}

Game.pickAndParseTask = function(cat) {
	const r = Game.randomInt(0, Game.taskbank[cat].length - 1)
	const task = Object.assign({}, Game.taskbank[cat][r])
	//TODO parse task.description w/ the <player[x]> syntax etc.
	return task
}

Game.assignActivePlayer = function() {
	Game.activePlayer = Controller.players[playerKeys[playerKeyIndex]]
	playerKeyIndex = (playerKeyIndex + 1) % playerKeys.length
	return Game.activePlayer
}


Game.playRound = function() {
	const player = Game.assignActivePlayer()
	$("#player-name").text(player.name)

	const cat = Game.pickCategory()

	if(Categories.raw[cat].hasOwnProperty("handler")) {
		Categories.raw[cat].handler()
	} else {
		const task = Game.pickAndParseTask(cat)
		$("#task-string").text(task.description)
		$("#drink-button").text("Drink " + Game.calculateSips(player.sips, task.penalty))
		//TODO enable/disable the forfeit buttons/do task buttons depending on whether the task allows for those actions respectively
	}
}

Game.generateRandomizer()
Game.compileTasks()
Game.playRound()