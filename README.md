# Wordle-Spelet
------------------------------------------------------
## Kommandon för att installera, köra och testa spelet
1. **npm install**
2. **npm start**
3. **npm test**
------------------------------------------------------
* Spelet ska utvecklas fullstack, med GUI utvecklat i React, och delar av spellogiken på backend via ett API.
* Spelets regler definieras av de algoritmer som beskrevs i kursens första uppgift.
* Spelet väljer ut ett slumpmässigt ord varje gång spelet startar – användaren kan bestämma hur många bokstäver ordet ska ha och om det får innehålla bokstäver som upprepas.
* Användaren gissar vad ordet är genom att skriva in det i ett fritextfält.
* Spelet ger feedback enligt feedback-algoritmen, genom att visa användarens bokstäver i grönt (correct), gult (misplaced) eller rött (incorrect).
* När användaren gissar rätt ord är spelet över.
* Det slumpmässiga urvalet av ord ska ske på servern via ett API-anrop. En datakälla kan vara den datafil som finns på https://github.com/dwyl/english-words.
* Efter att användaren klarat spelet ska hen få möjlighet att ange sitt namn och skicka in resultatet till en highscore-lista. Den data som skickas in ska inkludera namnet, tiden från att spelet startade till att det slutade, gissningarna, samt inställningarna avseende ordets längd och unika bokstäver.
