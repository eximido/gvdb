const fs = require("fs");
const path = require("path");

const pathInDungeon = ['dungeondb2_ru','dungeondb2_en'];
const pathInSail = ['seadb2_ru','seadb2_en'];
const pathOut = 'build';

const dungeonTestPhrases = {
	ru: {
		bonusGodpower: 'Помолившись своим богам, они шагают по невидимому мосту над пропастью.',
		bonusHealth: 'Смонтированный в нише фонтан живой еды позволил приключенцам слегка поправить здоровье.',
		bossHint: 'Какой-то текст. Шестое чувство героев дает тревожный звоночек.',
		boss: 'Появившийся в комнате Random Boss Name лёгким движением руки изящно превращает визит вежливости в кровавую драку.',
		custom: 'За потерю героями здоровья, золота и трофеев администрация подземелья — Random God Name — ответственности не несёт.',
		deadEnd: 'Какой-то текст. В этом тупике приключенцы с удивлением читают на стене надпись: «Верной дорогой идёте, товарищи!»',
		directionless: 'Приключенцы следуют за большим зелёным камнеедом, прогрызающим себе путь сквозь толщу камня. Далее другой текст.',
		discard: 'Какой-то текст. Другие направления здесь ничем не хуже, но дорога на восток выстлана скатертью.',
		longJump: 'Яркая вспышка заставляет приключенцев прикрыть глаза, а открывают они их совершенно в другом месте. Далее другой текст.',
		jumpingDungeon: 'Не рассчитав усилий, герои со всей дури прыгают на направление. Далее другой текст.',
		pointerMarker: 'В этой комнате приключенцы по очереди встают на весы, но стрелка каждый раз показывает на направление.',
		sideMarker: 'Вырезанный в полу символ намекает героям, что сокровище в какой-то половине подземелья.',
		staircaseHint: 'Здесь можно спуститься вниз, если команду на спуск подаст бог с персональным боссом.',
		staircase: 'По гласу хозяина +Random Boss Name+ открывает огромный люк, и герои осторожно спускаются на второй этаж подземелья.',
		trapGold: 'Плывущий в воздухе мираж таверны заставил героев привычно потерять часть наличности.',
		trapLowDamage: 'На стенах развешаны клетки, но канарейки в них лежат кверху лапками.',
		trapModerateDamage: 'Обитающий в этой комнате элементаль льда очень прохладно принимает гостей.',
		trapMoveLoss: 'Здесь ничего не понимающие приключенцы оказываются заперты вместе с мабританскими зоологами на заседании гаражного кооператива.',
		trapTrophy: 'При виде вращающегося чёрно-белого барабана герои непроизвольно выкладывают из сумок по трофею.',
		trapUnknown: 'Жуткая ловушка здесь пугает команду, но Random Hero что-то шепчет питомцу, и послушный Random Pet на несколько минут нейтрализует опасность.',
		treasureChest: 'Сокровищница! Измождённый старец чахнет над грудами злата и не способен оказать сопротивление молодым лоботрясам.',
		vault: 'Да это же кладовая! Здесь всё как в сокровищнице, только лучше.'
	},
	en: {
		bonusGodpower: 'Footsteps resonate here. The adventurers take advantage of the acoustics and form an impromptu a cappella group.',
		bonusHealth: 'The group finds a stone basin filled with condensed living water in the center of the room. Each member gets a sip.',
		bossHint: 'Some other text. Suddenly the entire team gets a case of the jitters.',
		boss: 'Random Hero polishes a monocle, peers into the darkness, and asks, “Doctor Random Boss Name, I presume?”',
		custom: 'A peculiar fact: this dungeon has a little divine touch.',
		deadEnd: null,
		directionless: 'The heroes closed their eyes and went somewhere. Some other text.',
		discard: 'Some other text. All directions are available, but the door leading south has been brightly painted for better visibility.',
		longJump: 'The party wakes up in another part of the dungeon, questioning if everything before now had just been a dream.',
		jumpingDungeon: 'A springboard trap in the floor catapults the party at some direction. Some other text.',
		pointerMarker: 'Random Hero passes a perception check and notices an arrow pointing at direction.',
		sideMarker: 'A gleaming glyph unequivocally suggests that the treasure is in some half of the dungeon.',
		staircaseHint: null,
		staircase: null,
		trapGold: 'A tricky device on the ceiling pulled some gold coins straight from the pockets of the careless adventurers.',
		trapLowDamage: 'The floor is covered with molten lava, except for the parts of it that are not.',
		trapModerateDamage: 'Random Hero pulled a rope hanging from the ceiling with all his might and got a slab with a concrete plate on his head.',
		trapMoveLoss: 'The adventurers need an additional turn to get through the quicksand in this room.',
		trapTrophy: 'With great difficulty Random Hero escaped a cobweb full of giant flies, leaving behind the Random Item.',
		trapUnknown: 'The heroes were about to step into a trap when Random Pet somehow blocked it and saved the day. Random Hero is proud of his pet.',
		treasureChest: 'The treasure! Diving into piles of gemstones, each adventurer swears to use this wealth to make a fresh start, get sober, and finally write that novel.',
		vault: 'This looks like a secret treasury! It\'s just like a regular treasury, but better.'
	}
};

(async () => {
	try {
		await fs.promises.mkdir(pathOut,{recursive: true});
		await Promise.all(pathInDungeon.map(async (dir) => {
			const stats = await fs.promises.stat(dir).catch(e => null);
			if (!stats || !stats.isDirectory()) {
				console.warn(dir + ' is not a directory or does not exist, skipping');
				return;
			}
			const content = {};
			const files = await fs.promises.readdir(dir);
			const lang = dir.substr(-2);
			await Promise.all(files.map(async (file) => {
				const contents = await fs.promises.readFile(path.join(dir, file), 'utf8');
				content[file] = contents.replace(/\r\n/g,'\n').split('\n').filter(a => !!a.trim()).join('|');
				try {
					if (!content[file]) throw 'expression must not be empty';
					new RegExp(content[file]);
				} catch(e) {
					throw 'regex is invalid in ' + dir + '/' + file + ':\n' + e;
				}
			}));
			if (!Object.keys(content).length) {
				console.warn('no content in ' + dir + ', skipping');
				return;
			}
			if (content['bossFinish']) {
				content['boss'] += '|' + content['bossFinish'];
				delete content['bossFinish'];
			}
			const regExps = {};
			Object.keys(content).forEach(cat => regExps[cat] = new RegExp(content[cat]));
			await Promise.all(Object.keys(dungeonTestPhrases[lang]).map(async (cat) => {
				if (dungeonTestPhrases[lang][cat] === null) {
					if (regExps[cat] && !regExps[cat].test('random text that should not match')) {
						return;
					}
					throw 'regex test failed ' + dir + '/' + cat + ': this is yet unused category that should not match an arbitrary text';
				}
				let matched = false;
				for (const rcat in regExps) {
					if (regExps[rcat].test(dungeonTestPhrases[lang][cat])) {
						if (rcat !== cat) {
							throw 'regex test failed in ' + dir + '/' + rcat + ': matched phrase from ' + cat;
						}
						matched = true;
					}
				}
				if (!matched) {
					throw 'regex test failed in ' + dir + '/' + cat + ': does not match with test phrase';
				}
			}));
			content.status = "success";
			await fs.promises.writeFile(path.join(pathOut, dir + '.json'), JSON.stringify(Object.keys(content).sort().reduce((obj, key) => { obj[key] = content[key]; return obj; }, {}), 'utf8'));
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
				contents.replace(/\r\n/g,'\n').split('\n').filter(a => !!a.trim()).forEach(beastie => {
					item = {name: beastie, hp: file};
					if (item.hp.startsWith('50-')) {
						item.tre = 1;
					}
					if (found = content.beasties.find(element => element.name === beastie)) {
						throw 'duplicated beastie "' + beastie + '" in ' + file + ' (' + found.hp + ')';
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