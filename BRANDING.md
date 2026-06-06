# Timebending® Branding

## Logo

`logo.png` — gecentreerd, hoogte 110px

```html
<img src="logo.png" alt="Timebending®" style="height:110px;width:auto;display:block;margin:0 auto 18px;">
```

## ® symbool

Altijd "Timebending®" — nooit zonder ®.

In een h1 titel is de ® te groot als gewone tekst. Gebruik dan:

```html
Timebending<sup style="font-size:0.45em;vertical-align:super;">®</sup>
```

In footer, labels en kleinere tekst volstaat gewoon `®`.

## Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Raleway:wght@300;400;500;600&display=swap');
```

- **Lora** (serif): koppen, kaart-tekst, subtitels, reflectietekst
- **Raleway** (sans-serif): labels, knoppen, navigatie

## Kleuren

| Variabele      | Waarde    | Gebruik                     |
|----------------|-----------|-----------------------------|
| `--cream`      | `#F9FFFA` | Achtergrond                 |
| `--warm-white` | `#ffffff` | Kaart-achtergrond           |
| `--sand`       | `#E8DFD2` | Borders, dividers           |
| `--gold`       | `#C89A3C` | Accenten, ®, links, labels  |
| `--purple`     | `#7B3FA0` | Titels, CTAs, focus         |
| `--plum`       | `#6B2F8E` | Hover states                |
| `--sage`       | `#8A9E82` | Linker border kaarten       |
| `--muted`      | `#8A7A9A` | Subtekst, placeholders      |
| `--deep`       | `#2A2438` | Body tekst                  |

## Header

```html
<div style="text-align:center;margin-bottom:40px;">
  <img src="logo.png" alt="Timebending®" style="height:110px;width:auto;display:block;margin:0 auto 18px;">
  <h1>[Titel met <em>nadruk</em>]</h1>
  <div class="gold-line" style="margin-bottom:16px;"></div>
  <p class="subtitle" style="margin-bottom:0;">[Subtitel]</p>
</div>
```

- `<em>` in h1 geeft goudkleurige cursieve nadruk
- Gold-line: 40px breed, 2px hoog

## Footer

```html
<p class="footer-note">Timebending® door <a href="https://meavia.nu">meavia.nu</a></p>
```

```css
.footer-note { text-align:center; font-size:11px; color:var(--muted); font-weight:300; letter-spacing:.04em; margin-top:52px; padding-top:24px; border-top:1px solid var(--sand); font-family:'Raleway',sans-serif; }
.footer-note a { color:var(--gold); text-decoration:none; }
```

## Laadanimatie

`spiraal.png` draait terwijl de tool nadenkt.

```html
<img src="spiraal.png" alt="" class="spiraal-spin">
```

```css
.spiraal-spin { width:80px; height:80px; display:block; transform-origin:center center; animation:spiraalDraaien 3s linear infinite; }
@keyframes spiraalDraaien { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }
```

## Knoppen

```css
/* Primair — paars gevuld */
.btn-dark { background:var(--purple); color:white; border:none; padding:12px 28px; font-family:'Raleway',sans-serif; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; border-radius:20px; transition:all .2s; }
.btn-dark:hover { background:var(--plum); transform:translateY(-1px); }
.btn-dark:disabled { opacity:.4; cursor:default; transform:none; }

/* Secundair — paarse outline */
.btn-ghost { background:transparent; color:var(--purple); border:1.5px solid var(--purple); padding:12px 28px; font-family:'Raleway',sans-serif; font-size:11px; font-weight:500; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; border-radius:20px; transition:all .2s; }
.btn-ghost:hover { border-color:var(--plum); background:rgba(123,63,160,.06); }

/* Tertiair — grijs outline, klein */
.btn-opnieuw { background:transparent; color:var(--muted); border:1.5px solid var(--sand); padding:10px 22px; font-family:'Raleway',sans-serif; font-size:10px; font-weight:500; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; border-radius:20px; transition:all .2s; }
.btn-opnieuw:hover { border-color:var(--muted); color:var(--deep); }

/* Paars gevuld (voor CTAs als delen/sturen) */
.btn-purple { background:var(--purple); color:white; border:none; padding:12px 28px; font-family:'Raleway',sans-serif; font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; border-radius:20px; transition:all .2s; }
.btn-purple:hover { background:var(--plum); transform:translateY(-1px); }
```

## Kaarten

Standaard kaart met linker groen accent:

```css
.card { border-left: 3px solid var(--sage); }
```

## Afbeeldingen

| Bestand               | Gebruik                                     |
|-----------------------|---------------------------------------------|
| `logo.png`            | Timebending® logo, bovenaan elke tool       |
| `spiraal.png`         | Draaiende animatie tijdens laden            |
| `sleutel-logo.png`    | Logo met 6 sleutels, bij de sleutels-keuze  |
| `kirsten_signature.png` | Handtekening Kirsten, bij delen/output    |
| `kirsten_van_ulden.png` | Portretfoto Kirsten                       |
