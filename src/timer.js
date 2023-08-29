function despliegaTimeStamp(){

// Obtener la marca de tiempo Unix actual (en segundos)
const unixTimestamp = Math.floor(new Date().getTime() / 1000);
console.log(unixTimestamp); // Imprimirá la marca de tiempo Unix actual

}




timerButton.addEventListener('click', () => {
  despliegaTimeStamp();
})