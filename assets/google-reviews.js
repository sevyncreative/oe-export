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

  (function() {
    var d = document, s = d.createElement('script');
    s.type = 'text/javascript';
    s.async = true;
    s.src = 'https://app.getwally.net/js/embed-widget.js?id=' + cfg.wallyWidgetId;
    (d.head || d.body).appendChild(s);
  })();
})()

  /* ---------- helpers ---------- */
  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c];
    });
  }
  function stars(n) {
    var full = Math.max(0, Math.min(5, Math.round(n || 0)));
    return "★★★★★".slice(0, full) + "<span class='dim'>" + "★★★★★".slice(full) + "</span>";
  }
  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); }).join("");
  }
  var G_ICON = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">' +
    '<path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>' +
    '<path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>' +
    '<path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>' +
    '<path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>';

  /* ---------- render everything ---------- */
  function render(place) {
    var rating = place.rating;
    var count = place.userRatingCount;
    var url = place.googleMapsURI || mapsSearchUrl;
    setProfileLinks(url);

    /* hero micro-trust line */
    var micro = document.getElementById("g-microtrust");
    if (micro && rating) {
      micro.innerHTML = '<a href="' + esc(url) + '" target="_blank" rel="noopener">' +
        rating.toFixed(1) + " on Google · " + count + " review" + (count === 1 ? "" : "s") + "</a>";
    }

    /* proof bar tile */
    var pbNum = document.getElementById("pb-rating");
    var pbLbl = document.getElementById("pb-rating-label");
    if (pbNum && rating) {
      pbNum.textContent = rating.toFixed(1) + "★";
      if (pbLbl) pbLbl.textContent = count + " Google reviews";
    }

    /* review cards */
    var grid = document.getElementById("g-reviews");
    var reviews = place.reviews || [];
    if (grid && reviews.length) {
      var html = "";
      reviews.slice(0, 6).forEach(function (rv, i) {
        var au = rv.authorAttribution || {};
        var name = au.displayName || "Google user";
        var photo = au.photoURI || "";
        var text = rv.text || "";
        var av = photo
          ? '<img class="av" src="' + esc(photo) + '" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML=\'<div class=&quot;av&quot;>' + esc(initials(name)) + '</div>\'">'
          : '<div class="av">' + esc(initials(name)) + "</div>";
        html +=
          '<div class="review g-live reveal in' + (i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : "") + '">' +
            '<span class="g-badge">' + G_ICON + " Google review</span>" +
            '<div class="stars">' + stars(rv.rating) + "</div>" +
            '<p class="g-text">' + esc(text) + "</p>" +
            '<div class="who">' + av +
              "<div><b>" + esc(name) + "</b><span>" + esc(rv.relativePublishTimeDescription || "") + "</span></div>" +
            "</div>" +
          "</div>";
      });
      grid.innerHTML = html;
      /* expand long reviews on tap */
      grid.querySelectorAll(".g-text").forEach(function (p) {
        p.addEventListener("click", function () { p.classList.toggle("open"); });
      });
    }

    /* summary line under the section heading */
    var sum = document.getElementById("g-summary");
    if (sum && rating) {
      sum.innerHTML = '<span class="stars">' + stars(rating) + "</span> <b>" + rating.toFixed(1) + "</b> from <b>" +
        count + "</b> Google reviews — pulled live from " +
        '<a href="' + esc(url) + '" target="_blank" rel="noopener">our Google profile</a>.';
      sum.hidden = false;
    }

    /* real project photos → auto-scrolling reel */
    var reelSection = document.getElementById("work");
    var track = document.getElementById("reel-track");
    var photos = place.photos || [];
    if (reelSection && track && photos.length >= 3) {
      var imgs = "";
      photos.slice(0, 10).forEach(function (ph) {
        try {
          imgs += '<img src="' + esc(ph.getURI({ maxHeight: 480 })) + '" alt="OE Services project photo" loading="lazy">';
        } catch (e) { /* skip photo */ }
      });
      if (imgs) {
        track.innerHTML = imgs + imgs; /* duplicated for a seamless loop */
        reelSection.hidden = false;
      }
    }
  }
})();
