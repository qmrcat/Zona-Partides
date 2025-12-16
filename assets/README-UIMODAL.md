# UIModal (Vanilla JS) — alert / confirm / prompt amb modals

**UIModal** és una llibreria “drop-in” (enganxa i llestos) per substituir `alert()`, `confirm()` i `prompt()` del navegador per **modals moderns**, **accessibles**, **responsius** (PC i mòbil) i amb **tema clar/fosc**.

Funciona en webs ja fetes: només cal afegir **un CSS** i **un JS**. No necessita frameworks, bundlers ni dependències.

---

## Què fa

- ✅ `UIModal.alert(message, options)` → mostra un avís i retorna una **Promise** que es resol quan l’usuari tanca.
- ✅ `UIModal.confirm(message, options)` → demana confirmació i retorna una **Promise<boolean>**.
- ✅ `UIModal.prompt(message, options)` → demana una entrada i retorna una **Promise<string|null>**.
- ✅ Crea el HTML del modal automàticament (no has d’afegir cap `<div>` a mà).
- ✅ Accessibilitat:
  - `role="dialog"`, `aria-modal="true"`, títol associat.
  - Trampa de focus (Tab/Shift+Tab no surt del modal).
  - Tecla `Esc` per tancar.
  - En tancar, retorna el focus a l’element que el tenia abans.
- ✅ Responsive:
  - PC: modal centrat.
  - Mòbil: estil “bottom sheet” (a baix).
- ✅ Tema:
  - Per defecte segueix el tema del sistema (`light/dark`) gràcies a `color-scheme`.
  - Permet forçar tema `light`, `dark` o tornar a `system`.

> Nota: A diferència de `confirm()` natiu, els modals personalitzats **sempre són asíncrons** (retornen Promises).

---

## Instal·lació

Copia els fitxers:
- `uimodal.js`
- `uimodal.css`

I inclou-los a la teva web (abans de `</body>`):

```html
<link rel="stylesheet" href="/assets/uimodal.css">
<script src="/assets/uimodal.js" defer></script>

Ús bàsic
alert
await UIModal.alert("Hola! Aquest és un alert personalitzat.");

confirm
const ok = await UIModal.confirm("Vols continuar?");
if (ok) {
  // acció confirmada
}

prompt
const nom = await UIModal.prompt("Com et dius?", {
  placeholder: "Nom…",
  defaultValue: ""
});

if (nom !== null) {
  console.log("Nom:", nom);
}

Important: await només dins de async

Això és incorrecte:

button.addEventListener("click", () => {
  const ok = await UIModal.confirm("Segur?"); // ❌ error
});


Correcte:

button.addEventListener("click", async () => {
  const ok = await UIModal.confirm("Segur?");
  if (ok) console.log("Confirmat!");
});


O bé amb .then():

button.addEventListener("click", () => {
  UIModal.confirm("Segur?").then(ok => {
    if (ok) console.log("Confirmat!");
  });
});

API
UIModal.alert(message, options)

Retorna: Promise<void>

Options:

title (string) — per defecte: "Avís"

okText (string) — per defecte: "D’acord"

closeOnBackdrop (boolean) — per defecte: true (tancar clicant el fons)

Exemple:

await UIModal.alert("S’ha desat correctament.", {
  title: "Fet",
  okText: "Perfecte"
});

UIModal.confirm(message, options)

Retorna: Promise<boolean>

Options:

title (string) — per defecte: "Confirmació"

okText (string) — per defecte: "Sí"

cancelText (string) — per defecte: "No"

danger (boolean) — per defecte: false (botó d’acceptar en vermell)

closeOnBackdrop (boolean) — per defecte: true

Exemple:

const ok = await UIModal.confirm("Vols eliminar aquest jugador?", {
  danger: true,
  okText: "Eliminar",
  cancelText: "Cancel·lar"
});

UIModal.prompt(message, options)

Retorna: Promise<string|null>

string → valor introduït

null → cancel·lació o tancament

Options:

title (string) — per defecte: "Entrada"

placeholder (string) — per defecte: ""

defaultValue (string) — per defecte: ""

okText (string) — per defecte: "Acceptar"

cancelText (string) — per defecte: "Cancel·lar"

type (string) — per defecte: "text" (p. ex. "email", "number", "password")

required (boolean) — per defecte: false (si és true, no accepta buit)

closeOnBackdrop (boolean) — per defecte: true

Exemple:

const email = await UIModal.prompt("Introdueix el teu email:", {
  type: "email",
  placeholder: "nom@domini.cat",
  required: true
});

Tema (clar/fosc)
Inicialitzar tema (opcional)

La llibreria crida initTheme() automàticament en DOMContentLoaded, però pots fer-ho manualment:

UIModal.initTheme();

Forçar tema
UIModal.setTheme("dark");   // "dark"
UIModal.setTheme("light");  // "light"
UIModal.setTheme("system"); // torna al sistema


El tema forçat es guarda a localStorage amb la clau: uimodal-theme.

Detalls d’accessibilitat

El modal defineix role="dialog" i aria-modal="true".

Trampa de focus dins del modal.

Esc tanca el modal.

En tancar, el focus torna a l’element que el tenia abans.

Botons i camps tenen estil de focus visible.

Compatibilitat

Pensat per navegadors moderns.

Sense dependències externes.

Si necessites compatibilitat amb navegadors molt antics, pot caldre un polyfill per a algunes APIs modernes.

Llicència

Afegeix la llicència que prefereixis (MIT, GPL, privada, etc.).


Si vols, també te’l puc deixar amb secció de “Canvis / Changelog” i una mini guia d’integració per quan la web ja té CSS conflictiu (Bootstrap/Tailwind) i cal “aïllar” més els estils.

