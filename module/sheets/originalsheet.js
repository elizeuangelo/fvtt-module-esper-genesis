const CHANGES = {
	'ol.currency label': (el) => {
		const labels = $([...el].filter((e) => !Object.keys(CONFIG.DND5E.currencies).includes(e.classList[1])));
		labels.next().remove();
		labels.remove();
	},
	'a.action-button.currency-convert.rollable i': (el) => {
		if (Object.keys(CONFIG.DND5E.currencies).length > 1) return;
		const grandParent = el[0].parentElement.parentElement;
		el.appendTo(grandParent);
	},
};

function modifySheet(sheet, html, options) {
	if (!['ActorSheet5eCharacter'].includes(sheet.constructor.name)) return;
	Object.entries(CHANGES).forEach(([key, fn]) => {
		const el = html.find(key);
		if (el) fn(el, sheet);
	});
}

Hooks.on('renderActorSheet', modifySheet);
