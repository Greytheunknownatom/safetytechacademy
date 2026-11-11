/* Form handling mode.
   'netlify' -> forms POST to Netlify Forms (works once deployed on Netlify; forms are detected from the HTML at deploy time)
   'demo'    -> no network call; the success state is simulated (use for previews / demos) */
window.STA_CONFIG = { formMode: 'netlify', popupDelayMs: 30000 };
