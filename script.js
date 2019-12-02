const $root = $("#root")
const Game = {}

Game.startGame = function(mode) {
	if(mode == "Battle Royale") {
		Game.mode = 0
	} else {
		Game.mode = 1;
	}
}

