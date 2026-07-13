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

  /* The Wally embed renders at the location of its own <script> tag, so the
     script must live inside the #wally-embed container (not the document head)
     for the widget to appear in the reviews section. */
  function loadWally() {
    var mount = document.getElementById("wally-embed");
    if (!mount) return;
    if (mount.querySelector("script")) return; /* already loaded */
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src = "https://app.getwally.net/js/embed-widget.js?id=" + cfg.wallyWidgetId;
    mount.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadWally);
  } else {
    loadWally();
  }
})();
