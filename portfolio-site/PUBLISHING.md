# Publish Portfolio

This portfolio is configured for **automatic GitHub Pages deployment** from this repo.

## One-time setup

1. Create a new GitHub repository (for example: `rithwik-portfolio`).
2. In this project root, add the remote:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
```

3. Push your code:

```bash
git add portfolio-site .github/workflows/portfolio-pages.yml
git commit -m "Add portfolio site and GitHub Pages deployment"
git push -u origin main
```

4. In GitHub repo settings, open `Settings -> Pages`.
5. Under **Build and deployment**, set `Source` to **GitHub Actions**.

## After setup

Any change under `portfolio-site/` pushed to `main` will auto-deploy.

## Live URL

Your portfolio will be available at:

- `https://<your-username>.github.io/<your-repo>/`

If you want a custom domain, add a `CNAME` file in `portfolio-site/` and configure DNS.
