🌸 Dahlia

Dahlia is a PWA that lets you and your loved one track travels, highlight visited countries, and save photo memories with captions on an interactive 3D globe.

Originally created as a personal anniversary project, Dahlia has since grown into a fun way to keep a shared travel log with pins, captions, and a wishlist for future adventures.

Features
=========
-Interactive 3D globe (powered by Globe.gl)

-Add pins with labels (Visited or Wishlist)

-Highlight countries you’ve visited

-Upload photos tied to specific pins

-Add captions to your photos for memories

-Firebase Authentication (login/logout)

-Firebase Firestore & Storage for saving pins, countries, and images

-PWA Support — install Dahlia as a standalone app on desktop or mobile


Tech Stack
===========
Frontend: HTML, CSS, JavaScript

3D Globe: Globe.gl
 + Three.js

Backend / Cloud: Firebase Authentication, Firestore, and Storage

Hosting: GitHub Pages

PWA: Service Worker + Manifest for offline/installable support

Project Structure
==================
dahlia/
│── icons/              # App icons
│── index.html          # Login page
│── globe.html          # Main globe page
│── landing.html        # Intro page with letter animation
│── style.css           # Globe styles
│── landing.css         # Landing page styles
│── script.js           # Globe logic
│── service-worker.js   # PWA caching
│── manifest.json       # PWA manifest

Inspiration
============
The project is named after the Dahlia flower, a symbol of eternal love.
This was meant as a gift and as a way to practice using APIs and database storage.
