// ネストされているループ文を抜け出したいときには
// ループ文にラベルをつけておき、それをbreakする

outer: for (let i = 0; i < 3; i++) {

  for (let j = 0; j < 3; j++) {

    let input = prompt(`Value at coords (${i},${j})`, '');

    // 文字から文字またはキャンセルされた場合、両方のループから抜ける
    if (!input) break outer; // (*)

    // 値に何かをする処理...
  }
}

alert('Done!');