const Unit = {
	nextUid: 0
}

Unit.load = function(unit, into) {
	return new Promise((resolve) =>
		$.ajax({url: "./views/unit/" + unit + ".html"}).then((result) => {
			var y = $(result)
			y.attr("uid", Unit.nextUid)
			var id = Unit.nextUid
			$(into).append(y)
			Unit.nextUid ++
			resolve(id)
		})
	)
}