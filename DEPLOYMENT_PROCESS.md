# Blazr App — Deployment Process

## ⚠️ Branch Rule (CRITICAL)
- Vercel deploys from **`main`** branch, NOT `master`
- ALL code changes MUST be pushed to **`main`** to trigger a deploy
- `master` is local-only sync; `main` is the deployment branch
- Before pushing: always verify `git branch` shows you on `main`

## Pre-Deploy QC Checklist
Before any `git push origin main`:

```bash
# 1. TypeScript compilation
cd blazr-app && npx tsc --noEmit

# 2. JSX balance check (Product card must be 7/7)
python3 -c "
import re
with open('src/app/catalogue/page.tsx') as f: c = f.read()
m = list(re.finditer(r'<CardContent[^>]*>([\s\S]*?)</CardContent>', c))
inner = m[1].group(1)
o = len(re.findall(r'<div\b', inner))
cl = len(re.findall(r'</div>', inner))
print(f'Product card divs: {o} opens / {cl} closes — {\"OK\" if o==cl else \"BROKEN\"}')"

# 3. Verify DB image URLs are GitHub CDN
curl -s "https://llsrgsbzhubwexbozerg.supabase.co/rest/v1/products?select=name,image_url&limit=2" \
  -H "apikey: sb_publishable_rw-pmchzyttuSjuHEFe7Eg_lH2DmFLQ" \
  -H "Authorization: Bearer sb_publishable_rw-pmchzyttuSjuHEFe7Eg_lH2DmFLQ" | \
  python3 -c "import json,sys; [print(p['name'],p.get('image_url','')[:50]) for p in json.load(sys.stdin)]"
```

## Push Commands
```bash
git checkout main
git pull origin main
# make changes...
git add . && git commit -m "description"
git push origin main   # ← triggers Vercel deploy
```

## Vercel Dashboard
- Check deploys at: https://vercel.com/dashboard
- Project: blazr-app
- Redeploy if needed from the Deployments page

## Supabase DB Image URLs
If images break again, check if URLs are:
- ✅ `https://raw.githubusercontent.com/gtlhopane/blazr-app/master/public/images/products/...`
- ❌ `https://blazr-app.vercel.app/images/products/...` (404s on stale deploys)

To fix: run `fix-image-urls.py` or update via Supabase dashboard.
