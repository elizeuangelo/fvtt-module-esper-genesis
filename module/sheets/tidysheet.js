import { RANK_POWER_CONSUMPTION } from '../powers.js';

const CHANGES = {
	'li[data-filter=ritual]': (el) => el.css('display', 'none'),
	'div.items-header-comps': (el) => {
		el.attr('title', 'Talent Cost');
		el.html('<i class="fas fa-bolt"></i>');
	},
	'div.items-header-school': (el) => {
		el.html('<i class="fas fa-hand-dots"></i>');
	},
	'li.item.innate div.item-detail.spell-comps': (el, sheet) => {
		const ids = [...el.parent()].map((el) => el.getAttribute('data-item-id'));
		const items = ids.map((id) => sheet.actor.items.get(id));
		[...el].forEach((el, idx) => (el.innerHTML = `<b>${RANK_POWER_CONSUMPTION[items[idx].system.level] || 'Free'}</b>`));
	},
	'li.currency-item input': (el) => {
		$([...el.parent()].filter((e) => !Object.keys(CONFIG.DND5E.currencies).includes(e.classList[1]))).remove();
	},
	'li.currency-item.convert': (el) => {
		if (Object.keys(CONFIG.DND5E.currencies).length > 1) return;
		el.remove();
	},
};

function modifySheet(sheet, html, options) {
	Object.entries(CHANGES).forEach(([key, fn]) => {
		const el = html.find(key);
		if (el) fn(el, sheet);
	});
}

Hooks.on('renderTidy5eSheet', modifySheet);
Hooks.on('renderTidy5eNPC', modifySheet);
