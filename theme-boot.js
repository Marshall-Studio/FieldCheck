/** Apply saved or system theme before paint to avoid a light/dark flash. No CSV data is read. */
(function () {
  var KEY = 'fieldcheck.theme.v1';
  var theme = 'light';
  try {
    var stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') theme = stored;
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) theme = 'dark';
  } catch (_) { /* private mode / blocked storage */ }
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
})();
