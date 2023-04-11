Hooks.once('init', () => {
	import('./module/system.js');
});
Hooks.once('setup', () => {
	import('./module/lang.js');
	import('./module/sheets/tidysheet.js');
	import('./module/sheets/originalsheet.js');
});
