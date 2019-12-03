const Categories = {
	raw: {
		dares_sexy: {
			name: "Sexual Dares",
			desc: "Only the thottiest of you will attempt some of these dares...",
			image: "sexy_symbol.png",
			weight: 7
		},
		dares_regular: {
			name: "Regular Dares",
			desc: "Good ol' fashioned dares.",
			image: "just_do_it.png",
			weight: 7
		},
		dares_risky: {
			name: "Risky Dares",
			desc: "A collection of dares for the more brave-hearted of you.",
			image: "danger_symbol.png",
			weight: 7
		},
		truths_sexy: {
			name: "Sexual Truths",
			desc: "Some steamy that will really test how honest you are.",
			image: "sexy_symbol.png",
			weight: 7
		},
		drink: {
			name: "Straight Drinking",
			desc: "You\'re playing a drinking game - what more do you want?",
			image: "bottle.png",
			weight: 4
		},
		nhie: {
			name: "Never Have I Ever",
			desc: "A classic assortment of \"Never have I ever ...\" questions.",
			image: "nhie.png",
			handler: function() {
				//TODO NHIE handler so it will cope with the whole table being proposed the question + select who drinks from it
			},
			weight: 8
		}
	}
}

Categories.populate = function() {
	for (const catid in Categories.raw) {
		const cat = Categories.raw[catid]
		Unit.load("category", $("#category-view")).then((id) => {
			var $elem = $("categoryunit[uid=" + id + "]")
			$elem.find(".category-title").text(cat.name)
			$elem.find(".category-description").text(cat.desc)
			$elem.find(".category-image").css("background-image", "url(" + "./images/" + cat.image + ")")
			$elem.find(".category-id").text(catid)
		})
	}
}

Categories.chosenEdited = function() {
	const $elems = $("categoryunit")
	for (var i = $elems.length - 1; i >= 0; i--) {
		console.log($($elems[i]).find("input"))
		if($($elems[i]).find("input")[0].checked) {
			$("#categories-chosen-button").attr("disabled", false)
			return;
		}
	}

	$("#categories-chosen-button").attr("disabled", true)
}
