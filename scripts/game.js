const Game = {
	playerKeyIndex: 0,
	playerKeys: null,
	activePlayer: null,
	activeSips: 0,
	randomizer: {

	},
	weightsum: 0,
	taskbank: {},
	regex: /<(player|sips)\[(md|ld|[0-9]+)\]>/g,
	calculateSipsParty: function(sipsIn, penalty) {
		const y = (2.5 + (penalty / 3)) * (100 / (sipsIn + 40))
		return Math.round(y)
	},
	calculateSipsStandard: function(sipsIn, penalty) {
		const y = (0.7 + (penalty / 16)) * Math.log(Math.pow(sipsIn, 3) + 5)
		return Math.round(y)
	},
	calculateSipsBrutal: function(sipsIn, penalty) {
		const y = Math.pow(Math.E, 0.01 * (sipsIn + 210 + (10 * penalty)))
		return Math.round(y)
	},
	calculateSipsRandomized: function(sipsIn, penalty) {
		var sips = Game.calculateSips(sipsIn, penalty)
		const r = Controller.randomInt(-(sips / 4), (sips / 4))
		sips += r
		return Math.round(sips)
	},
	calculateSips: null
}

Game.calculateSips = Game.calculateSipsStandard

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

Game.compileTasks = function() {
	Game.taskbank = {}
	for (var i = Controller.categories.length - 1; i >= 0; i--) {
		const e = Controller.categories[i]
		$.ajax({url: "./data/" + e + ".json", async: false, success: (result) => Game.taskbank[e] = result })
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
	if(task["isDrinking"] == null || task["isDrinking"] === "sips") {
		Game.activeSips = Game.calculateSips(Game.activePlayer.sips, task.penalty)
	} else {
		Game.activeSips = Number(task["isDrinking"])
	}

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

	const matches = task.description.match(Game.regex)

	if(matches != null) {
		for (var i = matches.length - 1; i >= 0; i--) {
			const index = matches[i].split("[")[1].split("]")[0]
		 	
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
			const regexp = new RegExp(Controller.escapeRegExp(matches[i]), "g")
			const index = matches[i].split("[")[1].split("]")[0]
			const playeri = parseMap[index]
			const arg = matches[i].split("[")[0].split("<")[1]

			if(arg === "player") {
				task.description = task.description.replace(regexp, playeri.name)
			} else if(arg === "sips") {
				task.description = task.description.replace(regexp, Game.calculateSipsRandomized(playeri.sips, task.penalty) + " sip(s)")
			}
		}
	}

	return task
}

Game.loadAssignedDrinkers = function() {
	for(const key in Controller.players) {
		Unit.load("drinker", $("#drinkers-view")).then((id) => {
			const $unit = $("drinkerunit[uid='" + id +"']")
			$unit.find(".player-id").text(key)
			$unit.find(".player-name").text(Controller.players[key].name)
		})
	}
}

Game.assignedDrinkersConfirmed = function() {
	const $c = $("input.assigned-drinker-checkbox")
	for (var i = $c.length - 1; i >= 0; i--) {
		if($c[i].checked) {
			Controller.players[$($c[i]).parent().parent().find(".player-id").text()].sips += Game.activeSips
		}
	}

	Game.playRound()
}

Game.assignActivePlayer = function() {
	Game.playerKeys = Object.keys(Controller.players)
	Game.activePlayer = Controller.players[Game.playerKeys[Game.playerKeyIndex]]
	Game.playerKeyIndex = (Game.playerKeyIndex + 1) % Game.playerKeys.length
	return Game.activePlayer
}

Game.setDecisionButtons = function(state1, state2, state3) {
	$("#task-button").attr("disabled", state1)
	$("#drink-button").attr("disabled", state2)
	$("#heart-button").attr("disabled", state3)
}


Game.playerDied = function(player) {
	Unit.loadPopup("player-dead-popup")
}

Game.playerResurrect = function() {
	Unit.hidePopupLayer()
	Game.activePlayer.sips += 7
	Game.activePlayer.hearts = 2
	Game.playRound()
}

Game.playerStayDead = function() {
	Unit.hidePopupLayer()
	Game.playRound()
}

Game.decisionMade = function(dec) {
	Game.setDecisionButtons(true, true, true)
	if(dec === "heart" && Game.activePlayer.hearts > 0) {
		Game.activePlayer.hearts -= 1

		if(Game.activePlayer.hearts === 0) {
			Game.playerDied(Game.activePlayer)
			return
		}
	} else if(dec === "drink" || (dec === "task" && "isDrinking" in Game.activeTask)) {
		if(Game.activeTask["drinkingGroup"] !== null) {
			const grp = Game.activeTask["drinkingGroup"]

			for(key in Controller.players) {
				var shouldDrink = (grp === "everyone") || (grp === "male" && Controller.players[key].male) || (grp === "female" && !Controller.players[key].male)

				if(shouldDrink) {
					Controller.players[key].sips += Game.activeSips
				}
			}
		} else {
			Game.activePlayer.sips += Game.activeSips
		}
	}

	Game.playRound()
}

Game.playRound = function() {
	$("#task-string").css("display", "none")
	$("#drink-button").text("Drink ?")
	$("#task-view *:not('#task-string')").remove();

	const player = Game.assignActivePlayer()
	$("#player-name").text(player.name)
	$("#sips-string").text(player.sips)
	$("#heart-string").text(player.hearts)
	Unit.loadPopup("task-roll-popup")
}

Game.loadTask = function() {
	Unit.hidePopupLayer()
	$("#task-string").css("display", "")

	const cat = Game.pickCategory()

	if(Categories.raw[cat].hasOwnProperty("handler")) {
		$("#task-string").css("display", "none")
		Categories.raw[cat].handler()
	} else {
		const task = Game.pickAndParseTask(cat)
		Game.activeTask = task
		$("#task-string").text(task.description)
		
		// Disables the drink button if the penalty is -1 i.e. they have to lose a life or do the task
		if(task.penalty !== -1) {
			Game.setDecisionButtons(false, false, false)
			$("#drink-button").text("Drink " + Game.calculateSipsRandomized(Game.activePlayer.sips, task.penalty))
		} else {
			Game.setDecisionButtons(false, true, false)
			$("#drink-button").text("No alternative!")
		}
	}
}