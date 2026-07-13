/* ============================================================
   OE SERVICES — LIVE REVIEWS VIA WALLY
   Embeds Wally reviews widget and sets up fallback Google links.
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.OE_CONFIG || {};
  var mapsSearchUrl = "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(cfg.googleQuery || "OE Services LLC Las Vegas NV");

  /* Every element that links to Google gets the search URL. */
  function setProfileLinks(url) {
    document.querySelectorAll(".g-link").forEach(function (a) { a.href = url; });
  }
  setProfileLinks(mapsSearchUrl);

  /* Load Wally widget if configured. */
  if (!cfg.wallyWidgetId) return;

  (function () {
    var d = document, s = d.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://app.getwally.net/js/embed-widget.js?id=" + cfg.wallyWidgetId;
    (d.head || d.body).appendChild(s);
  })();
})();
