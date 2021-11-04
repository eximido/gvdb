const fs = require("fs");
const path = require("path");
const https = require("https");

function httpsGet(url) {
	return new Promise((resolve, reject) => {
		https.get(url, (resp) => {
			let chunks = [];

			resp.on('data', (chunk) => {
				chunks.push(chunk);
			});

			resp.on('end', () => {
				resolve(Buffer.concat(chunks));
			});

		}).on("error", (err) => {
			reject(err);
		});
	});
}

(async() => {
	const dungeonBaseURLs = ['https://gv.erinome.net/ext/dungeondb2_ru.dat', 'https://gv.erinome.net/ext/dungeondb2_en.dat'];
	Promise.all(dungeonBaseURLs.map(async (url) => {
		var buffer = await httpsGet(url),
			object = JSON.parse(buffer.toString('utf-8')),
			output = url.match('\/([^/]+)\.dat$');
		for (const property in object) {
			if (property === 'status') continue;
			let brace = 0, string = '', strings = [];
			for (const letter of object[property]) {
				switch (letter) {
					case '(':
						brace++;
						break;
					case ')':
						brace--;
						break;
					case '|':
						if (!brace) {
							strings.push(string);
							string = '';
							continue;
						}
				}
				string += letter;
			}
			if (string.length) {
				strings.push(string);
			}
			strings = strings.filter(a => !!a.trim());
			await fs.promises.mkdir(output[1],{recursive: true});
			await fs.promises.writeFile(path.join(output[1], property), strings.join('\n') + '\n', 'utf8');
		}
	}));
	const sailBaseURLs = ['https://gv.erinome.net/ext/seadb2_ru.dat', 'https://gv.erinome.net/ext/seadb2_en.dat'];
	Promise.all(sailBaseURLs.map(async (url) => {
		var buffer = await httpsGet(url),
			object = JSON.parse(buffer.toString('utf-8')),
			output = url.match('\/([^/]+)\.dat$'),
			groups = {};
		for (const beastie of object.beasties) {
			if (!groups[beastie.hp]) groups[beastie.hp] = [];
			groups[beastie.hp].push(beastie.name);
		}
		await fs.promises.mkdir(output[1],{recursive: true});
		Promise.all(Object.keys(groups).map(async (group) => {
			await fs.promises.writeFile(path.join(output[1], group.replace(/–/,'-')), groups[group].join('\n') + '\n', 'utf8');
		}));
	}));
})();

