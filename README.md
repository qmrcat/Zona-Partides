# 🎲 Marcador de Jocs de Taula

Una aplicació web per portar el control de puntuacions de qualsevol joc de taula. Totalment funcional sense necessitat de connexió a internet, amb emmagatzematge local al dispositiu.

## ✨ Característiques principals

### 🎮 Gestió de partides
- **Crea partides personalitzades** amb el nom que vulguis
- **Afegeix jugadors** (separats per comes per afegir-ne diversos alhora)
- **Defineix el nombre de rondes** (de 1 a 50)
- **Desa automàticament** totes les partides al dispositiu
- **Llista de partides** ordenades per data d'última modificació

### 📊 Dos modes de puntuació

#### Mode acumulatiu (per defecte)
- Els punts es **sumen** a cada ronda
- Guanya qui té **més punts** al final
- Ideal per: Catan, Carcassonne, Ticket to Ride, etc.

#### Mode countdown / compte enrere (puntuació inicial)
- Cada jugador comença amb una **puntuació inicial** (ex: 40 punts)
- Els punts es **resten** de la puntuació inicial
- Guanya qui té **més punts restants**
- Els totals negatius es mostren en **vermell**
- Ideal per: Mus, Cinquillo, i jocs d'eliminació

### 🏆 Sistema de puntuació

- **Taula de puntuacions** amb files per rondes i columnes per jugadors
- **Càlcul automàtic** dels totals per cada jugador
- **Ressaltat del/s guanyador/s** en temps real
- **Resum ordenat** al peu, del primer al darrer
- **Scroll vertical** per veure totes les rondes
- **Totals fixos** a la capçalera mentre fas scroll

### ✏️ Personalització

- **Edita els noms de les rondes**: Fes clic al botó de tres punts (⋮) al costat de la ronda i selecciona "Editar nom" (ex: "Primera part", "Descans", "Final")
- **Afegeix jugadors** durant la partida
- **Afegeix rondes** en qualsevol moment
- **Menús contextuals** amb botó de tres punts (⋮):
  - **Jugadors**: Eliminar jugador
  - **Rondes**: Editar nom o eliminar ronda
- **Funció Desfer**: Recupera jugadors o rondes eliminades accidentalment (5 segons)

### 💾 Emmagatzematge

- **Desa automàticament** cada canvi al localStorage del navegador
- **Sense servidor**: Totes les dades es queden al teu dispositiu
- **Compatible** amb partides antigues si actualitzes l'aplicació
- **Privacitat total**: Les dades no surten mai del teu dispositiu

### 📱 Disseny responsive

- **Interfície moderna** amb tema fosc
- **Optimitzat per mòbil** i tauletes
- **Accessible**: Navegació per teclat i lectors de pantalla
- **Botons tàctils**: Toca per mostrar opcions d'eliminació en mòbil

## 🚀 Com utilitzar-la

### 1. Crear una partida nova

1. Introdueix el **nom de la partida** (ex: "Catan amb la colla")
2. Afegeix els **jugadors** (pots escriure'ls separats per comes: "Anna, Joan, Pau")
3. Defineix el **nombre de rondes**
4. *(Opcional)* Activa el **mode countdown** si vols puntuació inicial
5. Fes clic a **"Crear tauler"**

### 2. Registrar puntuacions

1. Introdueix els punts de cada jugador a cada ronda
2. Els totals s'actualitzen **automàticament**
3. El/s **guanyador/s** es ressalten amb color destacat
4. El resum del peu mostra la classificació ordenada

### 3. Personalitzar rondes

- Fes **clic al botó de tres punts (⋮)** al costat de qualsevol ronda
- Selecciona **"Editar nom"** per canviar-lo
- Útil per marcar fases del joc: "Preparació", "Ronda final", etc.

### 4. Gestionar la partida

- **Afegir ronda**: Botó "+ Ronda" per allargar la partida
- **Afegir jugador**: Camp a la capçalera per sumar jugadors durant el joc
- **Menús contextuals**: Botons de tres punts (⋮) per més opcions
  - En **ordinador**: Apareixen en passar el ratolí
  - En **mòbil**: Toca el nom del jugador o ronda per mostrar-los
- **Opcions de ronda** (⋮):
  - ✏️ Editar nom de la ronda
  - 🗑️ Eliminar ronda
- **Opcions de jugador** (⋮):
  - 🗑️ Eliminar jugador
- **Desfer**: Si elimines alguna cosa per error, tens 5 segons per desfer-ho

### 5. Tancar i recuperar partides

- **"Tancar"**: Torna a la pantalla principal sense esborrar res
- **"Esborrar"**: Elimina la partida permanentment (amb confirmació)
- Totes les partides es desen automàticament
- Obre qualsevol partida desada amb el botó **"Obrir"**

## 🎯 Casos d'ús

### Jocs acumulatius
- **Catan**: Suma punts per ciutat, carrer, etc.
- **Carcassonne**: Acumula punts per ciutat, camins, etc.
- **7 Wonders**: Suma punts de ciència, militar, meravelles, etc.

### Jocs countdown
- **Mus**: Comença amb 40 punts, el primer que arriba a 0 perd
- **Cinquillo**: Comença amb punts, perd qui acumuli més penalitzacions
- **Jocs d'eliminació**: Marca quan algú es queda sense punts

### Tornejos i lligues
- Porta el control de **múltiples partides**
- Ideal per **lligues** amb diverses sessions
- Compara resultats entre **diferents dates**

## 🛠️ Tecnologies utilitzades

- **HTML5**: Estructura semàntica
- **CSS3**: Disseny modern amb variables CSS i gradients
- **JavaScript (Vanilla)**: Sense frameworks, codi natiu
- **localStorage**: Persistència de dades al navegador
- **UIModal**: Biblioteca personalitzada per diàlegs modals

## 📋 Requisits

- Navegador web modern (Chrome, Firefox, Safari, Edge)
- JavaScript activat
- localStorage disponible (activat per defecte en tots els navegadors)

## 🔒 Privacitat

Aquesta aplicació:
- ✅ **No requereix connexió** a internet després de carregar-la
- ✅ **No envia dades** a cap servidor
- ✅ **No recull informació** personal
- ✅ **Emmagatzema localment** totes les dades al teu dispositiu
- ✅ **Codi obert**: Pots revisar tot el codi font

## 📱 Instal·lació (PWA)

Aquesta aplicació es pot instal·lar com una app al teu dispositiu:

1. Obre-la al navegador del teu mòbil
2. Al menú del navegador, cerca **"Afegir a pantalla d'inici"** o **"Instal·lar"**
3. Ara la pots obrir com una app nativa!

## 🐛 Solució de problemes

### Les dades han desaparegut
- Les dades s'emmagatzemen al localStorage del navegador
- Si has esborrat les dades del navegador, les partides s'hauran perdut
- **Consell**: Fes captures de pantalla dels resultats importants

### No puc editar els noms de rondes
- Fes clic al **botó de tres punts (⋮)** al costat de la ronda
- Selecciona **"Editar nom"** del menú contextual
- Ha d'aparèixer un diàleg per introduir el nou nom

### Els botons de tres punts no apareixen en mòbil
- **Toca el nom del jugador** o l'etiqueta de la ronda
- El botó (⋮) apareixerà
- Fes clic al botó per obrir el menú d'opcions
- Toca fora per amagar-lo

## 📄 Llicència

Aquesta aplicació és lliure d'usar, modificar i distribuir.

## 🙏 Crèdits

Desenvolupat amb ❤️ per facilitar les partides de jocs de taula.
Fet a Catalunya.

---

**Versió**: 2.0  
**Darrera actualització**: Desembre 2024