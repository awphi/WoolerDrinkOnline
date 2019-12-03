const Game = {
	playerKeyIndex: 0,
	playerKeys: null,
	activePlayer: null,
	activeSips: 0,
	randomizer: {

	},
	weightsum: 0,
	taskbank: {},
	regex: /<(player|sips)\[(md|ld|[0-9]+)\]>/g
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

Game.calculateSips = function(sipsIn, penalty) {
	const y = (2.5 + (penalty / 3)) * (100 / (sipsIn + 40))
	return Math.round(y)
}

Game.compileTasks = function() {
	Game.taskbank = {}
	for (var i = Controller.categories.length - 1; i >= 0; i--) {
		const e = Controller.categories[i]
		if(!Categories.raw[e].hasOwnProperty("handler")) {
			$.ajax({url: "./data/" + e + ".json", async: false, success: (result) => Game.taskbank[e] = result })
		}
	}
}

Game.pickCategory = function() {
	const r = Controller.randomInt(0, Game.weightsum - 1)
	for(var id in Game.randomizer) {
		var e = Game.randomizer[id]

		if(r >= e.lower && r <= e.upper) {
			return id
		}
	}
}

Game.getRandomPlayer = function(parseMap) {
	const clone = Game.playerKeys.slice()
	for(key in parseMap) {
		var index = clone.indexOf(key);
	 
	    if (index > -1) {
	       clone.splice(index, 1);
	    }
	}

	if(clone.length <= 0) {
		return null
	}

	const r = Controller.randomInt(0, clone.length - 1)
	return Controller.players[clone[r]]
}

Game.registerSips = function(task) {
	Game.activeSips = Game.calculateSips(Game.activePlayer.sips, task.penalty)
	$("#drink-button").text("Drink " + Game.activeSips)
}

Game.getMostDrunkPlayer = function() {
	var highest = 0
	var pl = null

	for(key in Controller.players) {
		if(Controller.players[key].sips >= highest) {
			highest = Controller.players[key].sips
			pl = Controller.players[key]
		}
	}

	return pl
}

Game.getLeastDrunkPlayer = function() {
	var lowest = 1000000
	var pl = null

	for(key in Controller.players) {
		if(Controller.players[key].sips <= lowest) {
			lowest = Controller.players[key].sips
			pl = Controller.players[key]
		}
	}

	return pl
}


Game.pickAndParseTask = function(cat) {
	const r = Controller.randomInt(0, Game.taskbank[cat].length - 1)
	const task = Object.assign({}, Game.taskbank[cat][r])
	Game.registerSips(task)

	const parseMap = {
		"0": Game.activePlayer,
		"md": Game.getMostDrunkPlayer(),
		"ld": Game.getLeastDrunkPlayer()
	}

	const matches = [...task.description.matchAll(Game.regex)]

	for (var i = matches.length - 1; i >= 0; i--) {
		const index = matches[i][2]
	 	
	 	// Assigns players into parseMap
	 	if(!(index in parseMap)) {
	 		const pl = Game.getRandomPlayer(parseMap)

	 		if(pl == null) {
	 			return Game.pickAndParseTask(cat);
	 		} else {
				parseMap[index] = pl
	 		}
	 	}
	}

	for (var i = matches.length - 1; i >= 0; i--) {
		const regexp = new RegExp(Controller.escapeRegExp(matches[i][0]), "g")
		const playeri = parseMap[matches[i][2]]

		if(matches[i][1] === "player") {
			task.description = task.description.replace(regexp, playeri.name)
		} else if(matches[i][1] === "sips") {
			task.description = task.description.replace(regexp, Game.calculateSips(playeri.sips, task.penalty))
		}
	}

	return task
}

Game.assignActivePlayer = function() {
	Game.playerKeys = Object.keys(Controller.players)
	Game.activePlayer = Controller.players[Game.playerKeys[Game.playerKeyIndex]]
	Game.playerKeyIndex = (Game.playerKeyIndex + 1) % Game.playerKeys.length
	return Game.activePlayer
}

Game.setDecisionButtons = function(state) {
	$("#task-button").attr("disabled", state)
	$("#drink-button").attr("disabled", state)
	$("#heart-button").attr("disabled", state)
}

Game.decisionMade = function(dec) {
	Game.setDecisionButtons(true)
	if(dec === "drink") {
		Game.activePlayer.sips += Game.activeSips
	} else if(dec === "heart") {
		//TODO heart system etc.
	}

	Game.playRound()
}

Game.playRound = function() {
	const player = Game.assignActivePlayer()
	$("#player-name").text(player.name + " - " + player.sips + " sips")

	const cat = Game.pickCategory()

	if(Categories.raw[cat].hasOwnProperty("handler")) {
		Categories.raw[cat].handler()
	} else {
		const task = Game.pickAndParseTask(cat)
		$("#task-string").text(task.description)
		$("#drink-button").text("Drink " + Game.calculateSips(player.sips, task.penalty))
		Game.setDecisionButtons(false)
	}
}