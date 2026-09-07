//Das Skript wird beim laden der Seite immer 1x ausgeführt, um den eventlistener zu registrieren. Der code im eventListener aber erst wenn er auch geklickt wird.

//Das elememt zu der ID darkmode-btn-id in die variable laden
const darkmodeBtn = document.getElementById('darkmode-btn-id');

//Text des Buttons ändern
function updateBtnText() {
  if (document.documentElement.classList.contains('darkmode')) {
    darkmodeBtn.textContent = 'Lightmode aktivieren';
  } else {
    darkmodeBtn.textContent = 'Darkmode aktivieren';
  }
}

updateBtnText();

//Einen Listener hinzufügen, der den Knopf "abhört", ob er geklickt wird und dann die aktion in der geschweiften Klammer ausführt
darkmodeBtn.addEventListener('click', () => {
  //fügt die darkmode class hinzu, bzw. entfernt sie. Toggle regelt das automatisch
  document.documentElement.classList.toggle('darkmode');

  //in den lokalen speicher speicher, ob's darkmode ist oder nicht
  if (document.documentElement.classList.contains('darkmode')) {
    localStorage.setItem('darkmode', 'dark');
  } else {
    localStorage.setItem('darkmode', 'light');
  }
  //Text der Buttons aktualisieren
  updateBtnText();
});
