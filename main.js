Hooks.once('init', () => {
	import('./module/system.js');
});
Hooks.once('setup', () => {
	import('./module/lang.js');
	import('./module/tidysheet.js');
});
