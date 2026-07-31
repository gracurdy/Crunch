# Our Atlas — family travel log

Mobile-first travel log hosted on GitHub Pages:
**https://gracurdy.github.io/Crunch/**

Trips and uploaded photos are saved **into this GitHub repository** (not only in the browser). That is why photos can persist on the live site.

## Why photos used to disappear

The first version tried to keep photos in `localStorage`. Browsers only allow a few MB there, so photo uploads often failed silently. Photos are now written to `assets/photos/` and trip data to `data/trips.json` via the GitHub API.

## Open it locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Add a trip (login)

1. Open the site → **Add**
2. Enter the **site password** (default: `OurAtlas`)
3. Enter a **GitHub personal access token** with write access to this repo
4. Fill in the trip form, choose photos, click **Save trip to GitHub**
5. Wait about a minute for GitHub Pages to rebuild, then refresh

Your token is kept in session storage for this browser tab only. It is not stored in the repo.

### Create the GitHub token

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. Resource owner: your account
3. Repository access: only **Crunch**
4. Permissions → Repository permissions → **Contents: Read and write**
5. Generate the token and paste it into the login form

Classic tokens also work if they have the `repo` scope.

### Change the site password

Default password is `OurAtlas`. To change it:

```bash
echo -n 'YourNewPassword' | shasum -a 256
```

Put the hash into `config.js` as `adminPasswordHash`, then commit.

## What gets saved on GitHub

| Path | Purpose |
|------|---------|
| `data/trips.json` | All trip titles, notes, dates, coordinates, photo paths |
| `assets/photos/<trip-id>/` | Uploaded photos (resized JPEGs) |

Anyone can view the public Pages site. Only someone with the password **and** a write token can change content.

## Important security note

This is a simple family setup. The site password hash is visible in the frontend, so the real protection is your GitHub token. Do not use a powerful token that can access other private repos. Prefer a fine-grained token limited to **Crunch**.
