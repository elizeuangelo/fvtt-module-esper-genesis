CONFIG.DND5E.currencies = {
	cu: { label: 'Cubil (digital)', abbreviation: 'cu', conversion: 1 },
};
CONFIG.DND5E.encumbrance.currencyPerWeight = {
	imperial: 50000,
	metric: 110000,
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

Hooks.on('ready', () => {
	// Sets Currency Weight to 0
	if (game.user.isGM && game.settings.get('dnd5e', 'currencyWeight')) {
		ui.notifications.info('Setting currency weight to zero...');
		game.settings.set('dnd5e', 'currencyWeight', false);
	}
});
