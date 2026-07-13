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

  /* Wally's embed.js scans the page for [data-wally-widget] containers and
     renders each widget inside them. Tag the #wally-embed container with the
     configured widget id, then load the embed script. */
  var WALLY_SRC = "https://embed.getwally.net/embed.js";

  function loadWally() {
    var mount = document.getElementById("wally-embed");
    if (!mount) return;
    mount.setAttribute("data-wally-widget", cfg.wallyWidgetId);
    mount.style.width = "100%";
    if (document.querySelector('script[src="' + WALLY_SRC + '"]')) return; /* already loaded */
    var s = document.createElement("script");
    s.src = WALLY_SRC;
    s.defer = true;
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadWally);
  } else {
    loadWally();
  }
})();
