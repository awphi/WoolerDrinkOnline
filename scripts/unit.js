const Unit = {
	nextUid: 0,
	cache: {}
}

Unit.load = function(unit, into) {
	return new Promise((resolve) => {
		if(Unit.hasOwnProperty(unit)) {
			const id = Unit.loadInternal(into, result)
			resolve(id)
			
		} else {
			$.ajax({url: "./views/unit/" + unit + ".html"}).then((result) => {
				Unit.cache[unit] = result
				const id = Unit.loadInternal(into, result)
				resolve(id)
			})
		}
	})
}

Unit.loadPopup = function(unit) {
	const $pl = $("#popup-layer")
	$pl.empty()
	$pl.css("display", "flex")

	return Unit.load(unit, $pl)
}

Unit.hidePopupLayer = function() {
	const $pl = $("#popup-layer")
	$pl.empty()
	$pl.css("display", "none")
}

Unit.loadInternal = function(into, result) {
	var y = $(result)
	y.attr("uid", Unit.nextUid)
	var id = Unit.nextUid
	$(into).append(y)
	Unit.nextUid ++
	return id;
}