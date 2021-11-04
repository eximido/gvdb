const fs = require("fs");
const path = require("path");

const pathInDungeon = ['dungeondb2_ru','dungeondb2_en'];
const pathInSail = ['seadb2_ru','seadb2_en'];
const pathOut = 'build';

(async () => {
	try {
		await fs.promises.mkdir(pathOut,{recursive: true});
		await Promise.all(pathInDungeon.map(async (dir) => {
			const stats = await fs.promises.stat(dir).catch(e => null);
			if (!stats || !stats.isDirectory()) {
				console.warn(dir + ' is not a directory or does not exist, skipping');
				return;
			}
			const content = {status: "success"};
			const files = await fs.promises.readdir(dir);
			await Promise.all(files.map(async (file) => {
				const contents = await fs.promises.readFile(path.join(dir, file), 'utf8');
				content[file] = contents.split('\n').filter(a => !!a.trim()).join('|');
			}));
			if (!Object.keys(content).length) {
				console.warn('no content in ' + dir + ', skipping');
				return;
			}
			await fs.promises.writeFile(path.join(pathOut, dir + '.json'), JSON.stringify(content), 'utf8');
		}));
		await Promise.all(pathInSail.map(async (dir) => {
			const stats = await fs.promises.stat(dir).catch(e => null);
			if (!stats || !stats.isDirectory()) {
				console.warn(dir + ' is not a directory or does not exist, skipping');
				return;
			}
			const content = {status: "success", "beasties": []};
			const files = await fs.promises.readdir(dir);
			await Promise.all(files.map(async (file) => {
				var item, found;
				const contents = await fs.promises.readFile(path.join(dir, file), 'utf8');
				contents.split('\n').filter(a => !!a.trim()).forEach(beastie => {
					item = {name: beastie, hp: file};
					if (item.hp.startsWith('50-')) {
						item.tre = 1;
					}
					if (found = content.beasties.find(element => element.name === beastie)) {
						throw 'duplicated beastie "' + beastie + '" in ' + file + '(' + found.hp + ')';
					}
					content.beasties.push(item);
				});
			}));
			if (!content.beasties.length) {
				console.warn('no content in ' + dir + ', skipping');
				return;
			}
			content.beasties.sort((a,b) => {
				return -a.hp.localeCompare(b.hp, undefined, {numeric: true}) || a.name.localeCompare(b.name);
			});
			content.beasties.forEach(a => {
				a.hp = a.hp.replace('-','–');
			})
			await fs.promises.writeFile(path.join(pathOut, dir + '.json'), JSON.stringify(content), 'utf8');
		}));
	} catch (e) {
		console.error("exception:", e);
		process.exit(1);
	}
})();