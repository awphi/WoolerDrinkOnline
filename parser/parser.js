var fs = require('fs')
const data = []


fs.readFile('data.txt', 'utf8', function(err, contents) {
	const txt = contents.toString().split("\n")

	for (var i = txt.length - 1; i >= 0; i--) {
		var a = txt[i]
		data.push({
			"description": a,
			"sips": 2
		})
	}

	fs.writeFile('data.json', JSON.stringify(data), (err) => {
		console.log('The file has been saved!');
	});
})