# Tic-Tac-Toe (You vs CPU)

A tiny static web app (HTML/CSS/JS) you can run locally or host with GitHub Pages.

- **Game mode**: You vs CPU (easy) — CPU picks a random valid move
- **Tech**: Plain HTML + CSS + JavaScript (no frameworks, no build step)

## How to play

- Click a square to place your mark.
- Use **New game** to restart.
- Use **You start: X/O** to switch who starts (and which mark you play).

## Run it locally

### Option 1: just open the file

Open `index.html` in your browser.

### Option 2: run a tiny local server (recommended)

Some browsers apply extra restrictions when opening files directly. A local server avoids that.

If you have Python 3:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What the files do

- `index.html`: the page layout (title, buttons, board container)
- `styles.css`: the look and feel (responsive grid, hover/press states, win highlight)
- `app.js`: game rules + win detection + CPU logic

## Git vs GitHub (plain English)

- **Git** is the tool that keeps version history on your computer.
  - You make **commits** (snapshots) locally.
  - You can work offline.
- **GitHub** is a website/service that hosts Git repositories online.
  - It stores the “remote copy” of your repo.
  - It adds collaboration features (issues, pull requests, reviews, GitHub Pages).

You can use GitHub **without** using the `git` command by editing files in the GitHub web UI.

## Workflow A: “All in GitHub” (no Git required)

This repo was created and filled using GitHub-style commits without needing Git locally:

1. Create a repo on GitHub.
2. Add files (`index.html`, `styles.css`, `app.js`).
3. Each “Commit changes” in the browser creates a commit on the `main` branch.

That’s enough to learn:
- what a repo is
- what commits are
- how files change over time

## Workflow B: Local Git workflow (once Git is installed)

When you have Git installed, you can do the same work locally (faster for real development):

```bash
# 1) Download the repo
git clone https://github.com/kevo1001/tic-tac-toe.git
cd tic-tac-toe

# 2) Make edits in your editor, then check what changed
git status

# 3) Stage + commit your changes
git add .
git commit -m "Update UI"  # message can be anything descriptive

# 4) Upload to GitHub
git push
```

## Using `gh` (GitHub CLI)

`gh` is a tool for working with GitHub from the terminal (issues, PRs, repo info). Examples:

```bash
gh repo view --web
gh issue list
gh pr list
```

Note: `gh` is **not** a replacement for Git; it complements Git.

## (Optional) Host it with GitHub Pages

Once GitHub Pages is enabled for the repo, GitHub will host the site.

- Settings → Pages
- Source: Deploy from a branch
- Branch: `main` / folder `/ (root)`

