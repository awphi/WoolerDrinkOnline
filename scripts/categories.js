const Categories = {
	raw: {
		dares_sexy: {
			name: "Sexual Dares",
			desc: "Only the thottiest of you will attempt some of these dares...",
			image: "sexy_symbol.png",
			weight: 7
		},
		truths_sexy: {
			name: "Sexual Truths",
			desc: "Some steamy that will really test how honest you are.",
			image: "sexy_symbol.png",
			weight: 7
		},
		stb: {
			name: "Spin The Bottle",
			desc: "A simple game of chance...",
			image: "sexy_symbol.png",
			handler: function() {
				//TODO load a spin the bottle unit into the game view
			},
			weight: 2
		},
		drink: {
			name: "Straight Drinking",
			desc: "You\'re playing a drinking game - what more do you want?",
			image: "sexy_symbol.png",
			weight: 4
		},
		nhie: {
			name: "Never Have I Ever",
			desc: "A classic assortment of \"Never have I ever ...\" questions.",
			image: "sexy_symbol.png",
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
