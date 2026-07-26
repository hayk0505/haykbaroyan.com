# haykbaroyan.com

Personal site + hosting/DevOps learning project. Domain registered and DNS-managed on Cloudflare; hosted on a DigitalOcean droplet.

## Goals

- Host the personal site plus side projects (EU Deepfake Toolkit demo, possibly a startup MVP) on one droplet.
- Fixed, predictable monthly cost — no usage-based billing surprises.
- Real hands-on DevOps learning: reverse proxy config, container orchestration, CI/CD — not black-box PaaS shortcuts.

## Stack (planned)

- **Reverse proxy:** Caddy (or Nginx) — TLS termination + name-based routing, one container per project.
- **Frontends:** React + Vite, built and served as static `dist/` output directly via Caddy.
- **Orchestration:** Docker Compose — each project in its own Compose stack/directory.
- **DNS/CDN:** Cloudflare in front (DNS, optional orange-cloud proxy).
- **Deploy:** Per-project GitHub Actions workflows (push/restart only their own container) rather than standing SSH/root access.

## Droplet

- Basic Droplet, 2GB RAM / 1 vCPU (~$12/mo) baseline.
- Plan to size up to 4GB RAM / 2 vCPU (~$24/mo) before adding a database-backed app.
- Heavy/occasional compute (e.g. deepfake-detection inference) stays off the always-on web droplet — run separately, on-demand.

## Status

Early setup. See project notes/skill for full architecture rationale and open questions (droplet region, IaC timing, possible friend co-hosting).
