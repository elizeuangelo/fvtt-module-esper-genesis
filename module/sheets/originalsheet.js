const CHANGES = {
	'ol.currency label': (el) => {
		const labels = $([...el].filter((e) => !Object.keys(CONFIG.DND5E.currencies).includes(e.classList[1])));
		labels.next().remove();
		labels.remove();
	},
};

function modifySheet(sheet, html, options) {
	if (!(sheet instanceof game.system.applications.actor.ActorSheet5eCharacter)) return;
	Object.entries(CHANGES).forEach(([key, fn]) => {
		const el = html.find(key);
		if (el) fn(el, sheet);
	});
}

Hooks.on('renderActorSheet', modifySheet);
