# Our Atlas

Family travel log: **https://gracurdy.github.io/Crunch/**

## Open locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Sign in on the site

The website login is **password only**. Visitors never see setup details.

Default password after you finish the one-time setup below: whatever password you choose when sealing (example: `OurAtlas`).

## One-time owner setup (required for saving)

The live site is static, so saving trips/photos needs a write credential locked behind your password. You set this once; the site only asks for the password.

1. Create a fine-grained personal access token for **only this repository**, with **Contents: Read and write**.
2. From the repo root, run:

```bash
PASSWORD='OurAtlas' TOKEN='paste_your_token_here' node scripts/seal-secret.mjs
```

3. Commit and push the updated `config.js`.
4. On the live site, open **Add**, enter that same password, and save trips as usual.

To change the password later, run the same command again with the new password and token, then commit `config.js`.

## What gets saved

| Path | Purpose |
|------|---------|
| `data/trips.json` | Trip details and photo paths |
| `assets/photos/<trip-id>/` | Uploaded photos |

## Security note

Anyone who knows the password can unlock the sealed write credential in the browser. Use a password only trusted people know, and keep the token limited to this repo.
