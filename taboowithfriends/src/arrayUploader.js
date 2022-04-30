import { db } from "./constants";
import { wordsArray } from "./wordpack_array";

export function uploadWords() {
  db.collection("Words").doc("WordPack").set({ wordsArray, length: wordsArray.length });
}
