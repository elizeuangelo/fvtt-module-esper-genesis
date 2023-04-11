export const RANK_POWER_CONSUMPTION = {
	0: 0,
	1: 2,
	2: 3,
	3: 5,
	4: 6,
	5: 7,
};

const AbilityUseDialog = game.system.applications.item.AbilityUseDialog;

function getEsperLevel(actor) {
	if (!actor.system.spells) return;

	// Translate the list of classes into spellcasting progression
	const progression = { slot: 0 };
	const types = {};

	// NPCs don't get spell levels from classes
	if (actor.type === 'npc') {
		progression.slot = actor.system.details.spellLevel ?? 0;
		types.leveled = 1;
	} else {
		// Grab all classes with spellcasting
		const classes = actor.items.filter((cls) => {
			if (cls.type !== 'class') return false;
			const type = cls.spellcasting.type;
			if (!type) return false;
			types[type] ??= 0;
			types[type] += 1;
			return true;
		});

		for (const cls of classes) actor.constructor.computeClassProgression(progression, cls, { actor, count: types[cls.spellcasting.type] });
	}
	return progression.slot;
}

function getMaximumSpellLevel(esperLevel) {
	return ~~((esperLevel + 1) / 2);
}

function createRank(rank, resourceLabel, talent) {
	const cost = RANK_POWER_CONSUMPTION[rank];
	const hasSlots = talent >= RANK_POWER_CONSUMPTION[rank];
	return {
		level: rank,
		label: `${CONFIG.DND5E.spellLevels[rank]} (${hasSlots ? cost : 0} ${resourceLabel})`,
		canCast: true,
		hasSlots,
	};
}

async function powerUseDialog(item) {
	if (!item.isOwned) throw new Error('You cannot display an ability usage dialog for an unowned item');

	// Prepare data
	const uses = item.system.uses ?? {};
	const resource = item.system.consume ?? {};
	const quantity = item.system.quantity ?? 0;
	const recharge = item.system.recharge ?? {};
	const recharges = !!recharge.value;
	const sufficientUses = (quantity > 0 && !uses.value) || uses.value > 0;

	// Prepare dialog form data
	const data = {
		item: item,
		title: game.i18n.format('DND5E.AbilityUseHint', { type: game.i18n.localize(`ITEM.Type${item.type.capitalize()}`), name: item.name }),
		note: AbilityUseDialog._getAbilityUseNote(item, uses, recharge),
		consumeSpellSlot: true,
		consumeRecharge: recharges,
		consumeResource: resource.target && (!item.hasAttack || resource.type !== 'ammo'),
		consumeUses: uses.per && uses.max > 0,
		canUse: recharges ? recharge.charged : sufficientUses,
		createTemplate: game.user.can('TEMPLATE_CREATE') && item.hasAreaTarget,
		errors: [],
		spellLevels: [],
		isSpell: true,
	};

	const talent = item.parent.system.resources.primary;

	const levelMin = item.system.level,
		levelMax = getMaximumSpellLevel(getEsperLevel(item.parent)),
		resourceLabel = talent.label;

	for (let rank = levelMin; rank <= levelMax; rank++) {
		data.spellLevels.push(createRank(rank, resourceLabel, talent.value));
	}

	if (data.spellLevels.filter((data) => data.hasSlots).length === 0) {
		data.errors.push(`You have not enough ${talent.label} to cast the power`);
	}

	// Render the ability usage template
	let html = await renderTemplate('systems/dnd5e/templates/apps/ability-use.hbs', data);

	// Change the design
	html = html.replace('Consume Power Slot?', `Consume ${resourceLabel}?`);

	// Create the Dialog and return data as a Promise
	const icon = data.isSpell ? 'fa-hand' : 'fa-fist-raised';
	const label = game.i18n.localize(`DND5E.AbilityUse${data.isSpell ? 'Cast' : 'Use'}`);
	return new Promise((resolve) => {
		const dlg = new AbilityUseDialog(item, {
			title: `${item.name}: ${game.i18n.localize('DND5E.AbilityUseConfig')}`,
			content: html,
			buttons: {
				use: {
					icon: `<i class="fas ${icon}"></i>`,
					label: label,
					callback: (html) => {
						const fd = new FormDataExtended(html[0].querySelector('form'));
						const canCast = talent.value >= RANK_POWER_CONSUMPTION[fd.object.consumeSpellLevel];
						if (fd.object.consumeSpellSlot === false || canCast) {
							item.use({
								consumeTalentPoints: fd.object.consumeSpellSlot ? RANK_POWER_CONSUMPTION[fd.object.consumeSpellLevel] : 0,
								needsConfiguration: false,
							});
						} else {
							ui.notifications.warn(`You have not enough ${talent.label} to cast ${item.name}`);
						}
						resolve(fd.object);
					},
				},
			},
			default: 'use',
			close: () => resolve(null),
		});
		dlg.render(true);
	});
}

function preUseItem(item, config, options) {
	if (item.type !== 'spell' || item.system.level < 1 || item.system.preparation.mode !== 'innate') return;
	if (config.consumeTalentPoints !== undefined) return;

	//const minimumCost = RANK_POWER_CONSUMPTION[item.system.level];
	//const resource = item.parent.system.resources.primary;
	//const talentPoints = resource.value ?? 0;
	//
	//if (talentPoints < minimumCost) {
	//	ui.notifications.warn(`You don't have enough ${resource.label}`);
	//	return false;
	//}

	powerUseDialog(item);
	return false;
}

function itemUsage(item, config, options, usage) {
	if (config.consumeTalentPoints) {
		usage.actorUpdates['system.resources.primary.value'] = item.parent.system.resources.primary.value - config.consumeTalentPoints;
	}
}

Hooks.on('dnd5e.preUseItem', preUseItem);
Hooks.on('dnd5e.itemUsageConsumption', itemUsage);
