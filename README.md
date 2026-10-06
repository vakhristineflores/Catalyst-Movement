# The Catalyst Movement

An interactive one-page website for Catalyst Virtual Solutions, made to introduce potential partners to who we are, our heart, why we call it a movement, and our partnership programs.

Colors are black, white and orange only (`#0D0D0D`, `#FFFFFF`, `#F09067`). Fonts are Quicksand and Caveat from Google Fonts.

## What moves

- The headline rises in line by line, and the orange logo rings slowly spin.
- A progress bar along the top shows how far down the page you are, and the menu highlights the section you're in.
- Sections fade and slide in as you scroll, and the numbers count up.
- **"Wearing every hat":** visitors tap a task to send it away, or drag it around.
- The service, client and photo cards tilt in 3D when you hover over them.
- The 4-step staircases build up from the bottom.
- **Ripple rings:** hover over or tap a ring to read about clients, the team and church partners.
- **Program tabs:** switch between Affiliate, Ambassador and White Label, each with its own apply or booking button.
- **"Find your path" quiz:** three questions that recommend a program and link straight to its application.
- **Earnings estimator:** sliders show what a referral could be worth for Affiliates (5%) and Ambassadors (5–10%).
- **FAQ:** the questions people usually ask on a partner call.
- On desktop, an orange dot follows the cursor.
- Motion is turned off automatically for visitors who set their device to reduce motion.

## Files

```
index.html          the page
assets/styles.css   all styling
assets/main.js      all the interactions
assets/img/         logo marks and photos
.nojekyll           tells GitHub Pages to serve files as-is
```

There's no build step and nothing to install. It's plain HTML, CSS and JavaScript.

## Put it on GitHub Pages

1. Create a new repository on github.com, for example `catalyst-movement`.
2. Upload everything in this folder: on the repository page, choose **Add file → Upload files**, then drag the contents in. Keep the `assets` folder structure the same.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose the `main` branch and the `/ (root)` folder, then click **Save**.
4. After a minute or two, the site is live at `https://<your-username>.github.io/catalyst-movement/`.

To use your own domain (for example `movement.thecatalystvs.com`), add it under **Settings → Pages → Custom domain**, then add the DNS record GitHub shows you.

## Editing

- **Text:** everything is in `index.html`, in the order it appears on the page.
- **Photos:** replace files in `assets/img/` and keep the same file names, or update the `src` in `index.html`.
- **Application links:** Affiliate goes to thecatalystvs.com/refer-a-friend, Ambassador goes to the Google Form, and White Label goes to the Calendly booking page. To change one, search `index.html` and `assets/main.js` for the old link and replace it everywhere it appears.
- **FAQ:** each question is a `<details>` block in the FAQ section of `index.html`.
- **Ambassador terms:** the 5–10% and 2-year figures are in the Ambassador tab in `index.html`.
