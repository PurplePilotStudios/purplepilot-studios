# PurplePilot Studios — Roblox Gaming Hub

A free-hosting-ready, responsive studio website. No paid services, server, build pipeline, or framework required.

## Live links already connected

- **Christmas Obby 2026**: https://www.roblox.com/games/71224004487082/Christmas-Obby-2026

## Before launch: add your real links

Open **`config.js`** in any text editor. Replace only the blank `url: ""` values with links you control:

- `studio.communityUrl` — your Roblox studio community.
- `socials` — your TikTok, Instagram, and YouTube *actual* profile URLs.
- `games` → `arcade.url` — your published Arcade experience URL, and switch `status` to `"playable"`.
- `studio.contactEmail` — optional. Only add if you want to publish it.

Don't invent or assume that `@purplepilotstudios` is available. Edit the handles in `config.js` if your accounts use different usernames. The site automatically hides social accounts without real URLs, and doesn't show a misleading Play button for a game without a URL.

To add a game, copy a game object in `config.js`, use a new `id`, set `name`, `type`, `description`, `status`, `url`, and choose `art: "future"` for a generic card. You can add custom artwork later.

## Preview on your computer

Open `index.html` in a browser. The site works locally, including game links and layout.

## Publish free with Cloudflare Pages — simplest route

1. Sign up or log in at https://dash.cloudflare.com/
2. Open **Workers & Pages** and choose to create a Pages project using **Direct Upload**.
3. Upload the **contents of this folder** (or upload `purplepilot-hub.zip` after extracting if the dashboard supports that format for your setup).
4. Cloudflare assigns a `*.pages.dev` URL. Project names are subject to availability.
5. Open the URL and test the Play button on mobile.

Cloudflare's interface and plan limits can change. Refer to current official docs: https://developers.cloudflare.com/pages/get-started/direct-upload/

## Optional: deploy automatically from GitHub

1. Create a repository (e.g. `purplepilot-hub`) and upload all project files.
2. In Cloudflare, create a Pages project and connect that repository.
3. Set production branch to `main`, leave build command blank, and set output directory to `/` (repository root), for this plain HTML project.
4. Cloudflare automatically deploys subsequent commits.

Docs: https://developers.cloudflare.com/pages/get-started/git-integration/

This Git setup is a natural future integration point for **Purple Bot**: it can modify `config.js` and propose pull requests. Keep human approval before publishing or granting bots account permissions.

## Branding and asset credits

- Branding: generated PurplePilot Studios logo provided by user in this conversation.
- Game card illustrations: original CSS-style illustrative art; **not actual gameplay screenshots**. Replace with verified game screenshots before major promotional campaigns.
- No user analytics, tracking scripts, or cookies are included.
- Copyright footer is a studio branding convention; not a registration claim.

## Folder structure

```
index.html          Site content and structure
styles.css          Responsive styling and card illustrations
config.js           Games, links, social accounts, announcements
site.js             Renders game cards and social links
assets/
  studio-logo.webp  Full original logo optimized for web
  mark.webp         Cropped icon for header
  favicon.png       App icon
```


## November 23 content update — all three games

The `config.js` file now includes Type Your Power + Weapon, Christmas Obby 2026, and Arcade Experience, with all nine social-specific Roblox campaign links preserved in each game's `campaigns` object. All three Play buttons are enabled.

**Attribution caution:** The Type Your Power + Weapon and Arcade Experience Play buttons temporarily use their TikTok campaign links because their canonical experience URLs and dedicated Website campaign links have not been supplied. This means website clicks on these buttons may be counted under the TikTok campaigns. Replace each `url` with its official Roblox experience URL, or generate a dedicated Website campaign and enter its link as both `url` and `campaigns.website`. Christmas Obby uses its known canonical Roblox experience URL.

Do not publish social profile links or your Roblox community link until verified. Those values remain empty by design.

To update via GitHub website: open `config.js` and select the pencil icon; edit the needed URLs and commit to `main`. Cloudflare Pages will deploy changes automatically.

## V3 — videos and feedback

Add actual YouTube videos or Shorts to `config.js` under `clips`, with fields `gameId`, `title`, and `url`. Game IDs must match the catalog. Clips load YouTube only after the viewer clicks, and an external watch link is always available. Empty gallery links to the studio channel. No invented clips are displayed.

Feedback is disabled unless all four production settings exist. The private D1 inbox is intentionally not exposed by a public read API. Before enabling, review applicable child-privacy requirements for a Roblox audience; do not collect personal details from children, publish submissions, or treat the user warning as age verification. Establish a retention/deletion and moderation policy. Keep the feature disabled if those requirements are not met.

1. In Cloudflare, create a D1 database (e.g. purplepilot-feedback), use its Console to run the SQL in `feedback-schema.sql`.
2. Create a Turnstile widget for purplepilotstudios.pages.dev (Managed mode).
3. In Workers & Pages > purplepilotstudios > Settings > Bindings, bind the database as FEEDBACK_DB. In Variables and Secrets add TURNSTILE_SITE_KEY (text), TURNSTILE_SECRET_KEY (secret), and FEEDBACK_ENABLED (text, initially false). Never commit the secret.
4. After privacy review, change FEEDBACK_ENABLED to true and redeploy. Confirm the form appears, submit a test report, and check the private D1 Console with SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50;. Delete the test entry. If verification or insert fails, no success is displayed.
5. For periodic deletion, run DELETE FROM feedback WHERE created_at < datetime('now','-90 days'); or a shorter retention interval according to your policy. This is manual, not automatic.
6. To allow a newly registered game in feedback, update the server-side gameIds allowlist in functions/api/feedback.js as well as config.js.

The app stores only game ID, category, message, generated identifier, timestamp and review status. It does not intentionally persist IPs, emails or Roblox usernames. Cloudflare/Turnstile process technical request data; YouTube embeds are third-party content. No user feedback is sent to GitHub. Treat incoming messages as untrusted data if imported into Purple Bot.

Current site uses Git integration. Pages Functions are built by Cloudflare; no new paid service is required for normal free-tier usage, subject to quotas. Use the dashboard to check deployment and test the complete feedback flow before enabling it publicly.

Official docs: https://developers.cloudflare.com/pages/functions/bindings/ and https://developers.cloudflare.com/turnstile/get-started/server-side-validation/.
