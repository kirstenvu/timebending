# Timebending® – Project Context

## Locaties

| Bestand | Pad |
|---|---|
| WoL app broncode | `C:\Users\User\Documents\Claude\Projects\Online materiaal\wol-project\public\index.html` |
| Feedback pagina | `C:\Users\User\Documents\Claude\Projects\Online materiaal\wol-project\public\feedback.html` |
| Analyse API | `C:\Users\User\Documents\Claude\Projects\Online materiaal\wol-project\api\analyse.js` |
| Kirsten's stem | `C:\Users\User\Documents\Claude\Projects\Online materiaal\wol-project\api\stem.txt` |
| Vercel config | `C:\Users\User\Documents\Claude\Projects\Online materiaal\wol-project\vercel.json` |
| WoL upload tool | `C:\Users\User\Documents\Claude\Projects\Online materiaal\update-github.html` |
| Feedback upload tool | `C:\Users\User\Documents\Claude\Projects\Online materiaal\update-feedback-github.html` |
| WoL sync script | `C:\Users\User\Documents\Claude\sync_wol.py` |
| Feedback sync script | `C:\Users\User\Documents\Claude\Projects\Online materiaal\sync_feedback.py` |
| Apps Script (Google Sheet) | `C:\Users\User\Documents\Claude\Projects\Online materiaal\feedback-apps-script.js` |

## GitHub & Vercel

| | Waarde |
|---|---|
| GitHub repo | `kirstenvu/timebending` |
| Vercel project | `timebending` |
| WoL live URL | `https://timebending.vercel.app/wheel-of-life` |
| Feedback live URL | `https://timebending.vercel.app/feedback` |
| Embed code WoL | `<iframe src="https://timebending.vercel.app/wheel-of-life" width="100%" height="3000" style="border:none;"></iframe>` |

## Bron voor stem en methodiek

De **LIV Outline** (`C:\Users\User\Documents\Claude\Projects\Online materiaal\LIV Outline.docx`) is de enige waarheidsbron voor Kirstens toon en methodiek. De inhoud van `api/stem.txt` moet altijd direct uit de outline komen — nooit door Claude samengevat.

**Outline vernieuwen:** zeg "vernieuw de outline" → Claude leest de docx in, vervangt `api/stem.txt`, draait het sync script, en Kirsten uploadt.

## Update-workflow (na elke wijziging)

### WoL (index.html / analyse.js / vercel.json)
1. Bewerk het bestand
2. Voer `C:\Users\User\Documents\Claude\sync_wol.py` uit
3. Kirsten opent `update-github.html` en klikt **Upload nu**
4. Vercel deployt automatisch → live binnen ~1 minuut

### Feedback (feedback.html)
1. Bewerk `wol-project\public\feedback.html`
2. Voer `sync_feedback.py` uit
3. Kirsten opent `update-feedback-github.html` en klikt **Upload nu**

**Belangrijk:** Claude voert de sync-stap altijd automatisch uit na elke aanpassing.

## Feedback koppeling (nog in te stellen)

De feedback.html stuurt naar een Google Apps Script URL. Die staat nog als placeholder `'JOUW_APPS_SCRIPT_URL_HIER'` in feedback.html. Zodra Kirsten de Apps Script deployt (zie `feedback-apps-script.js`), vul de URL in op die plek en sync opnieuw.

## Branding kleuren

| Variabele | Waarde | Gebruik |
|---|---|---|
| `--cream` | `#F9FFFA` | Achtergrond |
| `--sand` | `#E8DFD2` | Borders, dividers |
| `--gold` / `--taupe` | `#C89A3C` | Accenten, logo-tekst |
| `--purple` | `#7B3FA0` | Titels, CTAs |
| `--plum` | `#6B2F8E` | Hover states |
| `--sage` | `#8A9E82` | Eerste indruk lijn |
| `--muted` | `#8A7A9A` | Subtekst |
| `--deep` / `--brown` | `#2A2438` | Bodytekst |

## Badge-logica (STRICT)

De badge in "Inzicht per gebied" mag alleen deze drie exacte waarden hebben:
- `"Sterk"` → alleen als eerste indruk EN pendel EXACT hetzelfde getal zijn
- `"Pendel hoger"` → pendel > eerste indruk (verschil > 1)
- `"Eerste indruk hoger"` → eerste indruk > pendel (verschil > 1)
- Lege badge `""` bij verschil van exact 1 of als er maar één score is

**Client-side validatie aanwezig** in index.html: badges met andere waarden worden genegeerd.

Badgekleuren:
- Sterk: `bg #8A6A1A`, tekst `#FFF7E0`
- Pendel hoger: `bg #5B1F7A`, tekst `#F3E8FF`
- Eerste indruk hoger: `bg #3D6B52`, tekst `#E8F5EE`

## Gebieden

Huis, Werk, Financiën, Gezondheid, Relaties, Mindset, Emoties, Doel en Missie, Passie, Zingeving, Spiritualiteit en Verbondenheid

## Analyse-output structuur (JSON van Claude API)

```json
{
  "intro": "...",
  "gebieden": [
    { "naam": "Gezondheid", "badge": "Sterk|Pendel hoger|Eerste indruk hoger|", "tekst": "3 zinnen", "groeipunt": "2 zinnen" }
  ],
  "afsluiting": "..."
}
```

Accentwoorden in tekst: `**woord**` of `**twee woorden**` → worden goudkleurig weergegeven.
