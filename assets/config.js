/* ============================================================
   OE SERVICES — SITE CONFIGURATION
   One place to paste your live keys. Nothing else needs editing.
   ============================================================

   1. googleMapsApiKey
      Get one at https://console.cloud.google.com → "APIs & Services"
      → enable "Maps JavaScript API" + "Places API (New)" → Credentials.
      Restrict the key to your domain (www.oeservices.us) before launch.
      Once pasted, the homepage automatically pulls your REAL Google
      rating, review count, customer reviews (with their profile
      photos) and your Google Business photos into the "Real projects"
      reel. Leave blank and the site still works — the reviews section
      simply links out to your Google profile instead.

   2. googlePlaceId (optional)
      Your Google Business Profile Place ID. Find it at
      https://developers.google.com/maps/documentation/places/web-service/place-id
      If left blank, the site finds your listing automatically by
      searching "OE Services LLC" near Las Vegas.

   3. formspreeId
      Create a free form at https://formspree.io (point it at
      ahernandez@oeservices.us) and paste the 8-character form ID here
      (the part after formspree.io/f/). Estimate requests will then be
      delivered straight to your inbox with all project details.
      If left blank, the estimator falls back to opening a pre-filled
      email in the customer's mail app instead — leads still reach you.
*/
window.OE_CONFIG = {
  googleMapsApiKey: "AIzaSyDLvu_r04AZSs4cZvRXpZn2eFgIPWDuvVs",
  googlePlaceId: "ChIJbRWYjISYmEsR_044jIQYm8I",
  formspreeId: "mjgqdngz",

  /* Used to locate the business on Google when googlePlaceId is blank,
     and for the "read our reviews" links before the API loads. */
  googleQuery: "OE Services",
  phone: "8055032787",
  email: "ahernandez@oeservices.us"
};
