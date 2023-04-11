CONFIG.DND5E.currencies = {
	digital: { label: 'Cubil (digital)', abbreviation: 'digital', conversion: 1, digital: true },
	coin: { label: 'Cubil (coin)', abbreviation: 'coin', conversion: 1, digital: false },
};
CONFIG.DND5E.encumbrance.currencyPerWeight = {
	imperial: 500,
	metric: 1100,
};
CONFIG.DND5E.itemActionTypes = {
	mwak: 'Melee Weapon Attack',
	rwak: 'Ranged Weapon Attack',
	msak: 'Melee Power Attack',
	rsak: 'Ranged Power Attack',
	save: 'Saving Throw',
	heal: 'Healing',
	abil: 'Ability Check',
	util: 'Utility',
	other: 'Other',
};
CONFIG.DND5E.skills = {
	acr: {
		label: 'Acrobatics',
		ability: 'dex',
	},
	ast: {
		label: 'Astrophysics',
		ability: 'int',
	},
	ath: {
		label: 'Athletics',
		ability: 'str',
	},
	com: {
		label: 'Computers',
		ability: 'int',
	},
	dec: {
		label: 'Deception',
		ability: 'cha',
	},
	ins: {
		label: 'Insight',
		ability: 'wis',
	},
	itm: {
		label: 'Intimidation',
		ability: 'cha',
	},
	inv: {
		label: 'Investigation',
		ability: 'int',
	},
	lor: {
		label: 'Lore',
		ability: 'int',
	},
	mec: {
		label: 'Mechanics',
		ability: 'wis',
	},
	med: {
		label: 'Medicine',
		ability: 'wis',
	},
	prc: {
		label: 'Perception',
		ability: 'wis',
	},
	prf: {
		label: 'Performance',
		ability: 'cha',
	},
	per: {
		label: 'Persuasion',
		ability: 'cha',
	},
	slt: {
		label: 'Sleight of Hand',
		ability: 'dex',
	},
	ste: {
		label: 'Stealth',
		ability: 'dex',
	},
	sur: {
		label: 'Survival',
		ability: 'wis',
	},
	xen: {
		label: 'Xenobiology',
		ability: 'int',
	},
};
CONFIG.DND5E.spellcastingTypes = {
	leveled: {
		label: 'Leveled Power',
		progression: {
			full: {
				label: 'Full Power',
				divisor: 1,
			},
			half: {
				label: 'Half Power',
				divisor: 2,
			},
			third: {
				label: 'Third Power',
				divisor: 3,
			},
		},
	},
};
CONFIG.DND5E.spellPreparationModes = {
	prepared: 'Technique',
	always: 'Always Prepared Technique',
	innate: 'Talent',
	atwill: 'Innate Talent',
};
CONFIG.DND5E.spellProgression = {
	none: 'None',
	full: 'Full',
	half: 'Half',
	third: 'Third',
};
CONFIG.DND5E.spellScalingModes = {
	cantrip: 'Prime',
	none: 'None',
	level: 'Power Rank',
};
CONFIG.DND5E.spellLevels = {
	0: 'Prime',
	1: '1st Rank',
	2: '2nd Rank',
	3: '3rd Rank',
	4: '4th Rank',
	5: '5th Rank',
};
CONFIG.DND5E.spellSchools = {
	frg: 'Forging Technique',
	alt: 'Alteration Talent',
	cla: 'Clairsentient Talent',
	elt: 'Elemental Talent',
	kin: 'Kinesis Talent',
	met: 'Metaphase Talent',
	psy: 'Psychogenic Talent',
};

CONFIG.DND5E.spellTags = {};
CONFIG.DND5E.spellComponents = {};

// Changes the encumbrance calculation to disgard Digital Coins
game.system.documents.Actor5e.prototype._prepareEncumbrance = function () {
	const encumbrance = (this.system.attributes.encumbrance ??= {});

	// Get the total weight from items
	const physicalItems = ['weapon', 'equipment', 'consumable', 'tool', 'backpack', 'loot'];
	let weight = this.items.reduce((weight, i) => {
		if (!physicalItems.includes(i.type)) return weight;
		const q = i.system.quantity || 0;
		const w = i.system.weight || 0;
		return weight + q * w;
	}, 0);

	// [Optional] add Currency Weight (for non-transformed actors)
	const currency = this.system.currency;
	if (game.settings.get('dnd5e', 'currencyWeight') && currency) {
		const numCoins = Object.entries(currency)
			.filter(([key, value]) => !CONFIG.DND5E.currencies[key]?.digital)
			.map(([key, value]) => value)
			.reduce((val, denom) => val + Math.max(denom, 0), 0);
		const currencyPerWeight = game.settings.get('dnd5e', 'metricWeightUnits')
			? CONFIG.DND5E.encumbrance.currencyPerWeight.metric
			: CONFIG.DND5E.encumbrance.currencyPerWeight.imperial;
		weight += numCoins / currencyPerWeight;
	}

	// Determine the Encumbrance size class
	let mod = { tiny: 0.5, sm: 1, med: 1, lg: 2, huge: 4, grg: 8 }[this.system.traits.size] || 1;
	if (this.flags.dnd5e?.powerfulBuild) mod = Math.min(mod * 2, 8);

	const strengthMultiplier = game.settings.get('dnd5e', 'metricWeightUnits')
		? CONFIG.DND5E.encumbrance.strMultiplier.metric
		: CONFIG.DND5E.encumbrance.strMultiplier.imperial;

	// Populate final Encumbrance values
	encumbrance.value = weight.toNearest(0.1);
	encumbrance.max = ((this.system.abilities.str?.value ?? 10) * strengthMultiplier * mod).toNearest(0.1);
	encumbrance.pct = Math.clamped((encumbrance.value * 100) / encumbrance.max, 0, 100);
	encumbrance.encumbered = encumbrance.pct > 200 / 3;
};

function temporaryWorkaround(actor) {
	setTimeout(() => {
		const changes = Object.fromEntries(Object.entries(CONFIG.DND5E.skills).map(([key, value]) => [`system.skills.${key}.ability`, value.ability]));
		changes['system.resources.primary.label'] = 'Talent Points';
		changes['system.resources.primary.lr'] = true;

		// Erase old currencies -> doesnt last
		//changes['system.currency.-=pp'] = null;
		//changes['system.currency.-=gp'] = null;
		//changes['system.currency.-=ep'] = null;
		//changes['system.currency.-=sp'] = null;
		//changes['system.currency.-=cp'] = null;

		// Create new currencies
		Object.entries(flattenObject({ 'system.currency': Object.fromEntries(Object.keys(CONFIG.DND5E.currencies).map((key) => [key, 0])) })).forEach(
			([key, value]) => (changes[key] = value)
		);

		actor.update(changes, { performDeletions: true });
	}, 0);
}

Hooks.on('createActor', temporaryWorkaround);
