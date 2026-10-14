# matthijsmaas.com

Source of [matthijsmaas.com](https://matthijsmaas.com/), the website of Matthijs Maas.

- Built with [Hugo](https://gohugo.io/) (version in `netlify.toml`) and a small theme written for this site in `layouts/`, styled with [Tufte CSS](https://github.com/edwardtufte/tufte-css) (MIT licence, see `static/css/TUFTE-CSS-LICENSE.txt`).
- Hosted on Netlify, which rebuilds the site whenever `master` changes.
- Publications: one folder per item in `content/publication/` (`index.md` plus an optional `cite.bib` and `featured.jpg`). PDFs live in `static/uploads/`.
- Talks: one folder per talk in `content/event/`.
- The previous design (Wowchemy) is kept on the branch `wowchemy-backup`.
