# iPhone offline scorecard

This folder is a separate, touch-first Home Screen app. The original scorecard files in the project root are unchanged.

To install it without an Apple developer licence:

1. Deploy the project to any HTTPS static host (GitHub Pages, Netlify Drop, or Cloudflare Pages all work).
2. Open the `/ios/` address in **Safari** on the iPhone.
3. Tap **Share** → **Add to Home Screen** → **Add**.
4. Open it once. From then on, it runs without an internet connection and stores scores on the phone.

iOS does not permit installation of a normal native app from a file without Apple signing. A Home Screen app is Apple's no-licence alternative: it launches full-screen from an icon and works offline after the one-time install.
