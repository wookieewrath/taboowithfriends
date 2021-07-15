export function generateLobbyID() {
  let idArray = [];
  let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let x = 0; x < 5; x++) {
    idArray.push(alphabet.charAt(Math.floor(Math.random() * alphabet.length)));
  }
  return idArray.join("");
}
