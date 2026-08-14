SHAGUN JEWELLERY WEBSITE — START HERE
=======================================

You now have an ADMIN PANEL built into your website. Once it's set
up (one-time, ~15 minutes), editing your site looks like this:

   1. Go to shagunjewellery.ae/admin
   2. Log in with your email and password
   3. Edit text, add/remove collections, upload photos
   4. Click "Publish"
   5. Your live site updates automatically in under a minute

No code, no re-uploading zip files, ever again.

WHAT'S IN THIS FOLDER
----------------------
index.html, styles.css, script.js   -> the website itself (don't edit)
data/settings.json                  -> your business info & text
data/collections.json               -> your product collections
admin/                               -> the admin panel
assets/                              -> logo + uploaded photos

You CAN still hand-edit data/settings.json or data/collections.json
directly in a text editor if you ever want to — but once the admin
panel is set up below, you won't need to.


ONE-TIME SETUP (do this once, takes about 15 minutes)
=========================================================
The admin panel needs somewhere to permanently save your changes.
We'll use two free services: GitHub (stores your site's files) and
Netlify (hosts your live site and gives you the login system).

STEP 1 — Put this folder on GitHub
------------------------------------
1. Go to https://github.com and create a free account.
2. Click "+" (top right) -> "New repository".
3. Name it "shagun-website" -> keep it Public or Private, either
   works -> click "Create repository".
4. On the next page, click "uploading an existing file".
5. Drag this ENTIRE folder's contents (not the folder itself — the
   files and subfolders inside it) into the browser window.
6. Scroll down, click "Commit changes".

STEP 2 — Connect it to Netlify
---------------------------------
1. Go to https://app.netlify.com and sign up (you can sign up using
   your GitHub account — easiest option).
2. Click "Add new site" -> "Import an existing project".
3. Choose GitHub, then select the "shagun-website" repository you
   just created.
4. Leave all the settings as default -> click "Deploy".
5. Netlify gives you a temporary address — that's your site, live.

STEP 3 — Connect your domain
-------------------------------
1. In Netlify: Site settings -> Domain management -> Add a domain
   -> enter shagunjewellery.ae
2. Netlify shows you some DNS records.
3. Log into wherever you bought the domain -> DNS settings -> add
   the records Netlify showed you.
4. Wait 10 minutes to a few hours. Netlify adds free HTTPS
   (the padlock) automatically once it's connected.

STEP 4 — Turn on the login system (Netlify Identity)
--------------------------------------------------------
1. In Netlify, go to your site -> "Identity" tab -> click
   "Enable Identity".
2. Scroll to "Registration" -> set it to "Invite only" (so random
   people can't sign up to your admin panel).
3. Scroll to "Services" -> "Git Gateway" -> click "Enable Git
   Gateway". (This is what lets the admin panel save your changes.)

STEP 5 — Invite yourself as the admin user
----------------------------------------------
1. Still on the "Identity" tab, click "Invite users".
2. Enter your own email address -> send the invite.
3. Check your email, click the invite link — it will open your
   site and ask you to set a password.
4. Set your password. You're now the admin.

DONE. From now on:
   Go to shagunjewellery.ae/admin -> log in -> edit -> Publish.


DAY-TO-DAY: HOW TO EDIT YOUR SITE
====================================
- Change phone, email, address, timings, or any text:
  Admin panel -> "Site Settings" -> edit the field -> Publish.

- Add, remove, reorder, or edit a collection (e.g. "Bridal
  Collection"):
  Admin panel -> "Product Collections" -> edit the list -> Publish.

- Change or add a photo to a collection:
  Admin panel -> "Product Collections" -> click the collection ->
  click the photo field -> upload a new image -> Publish.

Every change goes live automatically within about a minute of
clicking Publish. You never need to touch code or re-upload a zip
file again.


THE CONTACT FORM
-------------------
The "Send Inquiry" form opens the visitor's email app with the
message pre-filled. It does NOT attach photos automatically — the
form tells visitors to attach their design photo before sending.
For photo-heavy design requests, the WhatsApp button next to it is
the faster option, since WhatsApp lets people send photos directly.


NEED HELP?
------------
Come back and ask Claude — describe what's happening (or attach a
screenshot/screen recording) and it can walk you through it or fix
the files directly.
