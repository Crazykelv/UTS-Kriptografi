let currentCipher = "";

function showCipherForm() {
  const select = document.getElementById("cipherSelect");
  const form = document.getElementById("cipherForm");
  const title = document.getElementById("cipherTitle");

  currentCipher = select.value;
  if (currentCipher === "") {
    form.style.display = "none";
    return;
  }

  form.style.display = "block";
  if (currentCipher === "standard") title.innerText = "Vigenere Cipher (Standar)";
  else if (currentCipher === "auto") title.innerText = "Auto-Key Vigenere Cipher";
  else if (currentCipher === "extended") title.innerText = "Extended Vigenere Cipher (ASCII)";
  else title.innerText = "Super Enkripsi (Extended Vigenere + Transposisi Kolom)";
}

function clearAll() {
  document.getElementById("plaintext").value = "";
  document.getElementById("key").value = "";
  document.getElementById("output").innerText = "";
}

function handleEncrypt() {
  switch (currentCipher) {
    case "standard": encryptStandard(); break;
    case "auto": encryptAuto(); break;
    case "extended": encryptExtended(); break;
    case "super": encryptSuper(); break;
    case "playfair": encryptPlayfair(); break;
    case "affine": encryptAffine(); break;
    default: alert("Pilih cipher terlebih dahulu!");
  }
}

function handleDecrypt() {
  switch (currentCipher) {
    case "standard": decryptStandard(); break;
    case "auto": decryptAuto(); break;
    case "extended": decryptExtended(); break;
    case "super": decryptSuper(); break;
    case "playfair": decryptPlayfair(); break;
    case "affine": decryptAffine(); break;
    default: alert("Pilih cipher terlebih dahulu!");
  }
}

// ====== Vigenere Utility ======
function vigenereShift(char, key, decrypt = false) {
  let base = 'A'.charCodeAt(0);
  let p = char.toUpperCase().charCodeAt(0) - base;
  let k = key.toUpperCase().charCodeAt(0) - base;
  if (p < 0 || p > 25) return char;
  let c = decrypt ? (p - k + 26) % 26 : (p + k) % 26;
  return String.fromCharCode(c + base);
}

// ====== STANDARD VIGENERE ======
function encryptStandard() {
  let text = document.getElementById('plaintext').value.toUpperCase().replace(/[^A-Z]/g, '');
  let key = document.getElementById('key').value.toUpperCase();
  if (!key) return alert('Key tidak boleh kosong!');
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += vigenereShift(text[i], key[i % key.length]);
  }
  document.getElementById('output').innerText = 'Ciphertext: ' + result;
}

function decryptStandard() {
  let text = document.getElementById('plaintext').value.toUpperCase().replace(/[^A-Z]/g, '');
  let key = document.getElementById('key').value.toUpperCase();
  if (!key) return alert('Key tidak boleh kosong!');
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += vigenereShift(text[i], key[i % key.length], true);
  }
  document.getElementById('output').innerText = 'Plaintext: ' + result;
}

// ====== AUTO-KEY VIGENERE ======
function encryptAuto() {
  let text = document.getElementById('plaintext').value.toUpperCase().replace(/[^A-Z]/g, '');
  let key = document.getElementById('key').value.toUpperCase();
  if (!key) return alert('Key tidak boleh kosong!');
  let fullKey = key + text;
  fullKey = fullKey.slice(0, text.length);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += vigenereShift(text[i], fullKey[i]);
  }
  document.getElementById('output').innerText = 'Ciphertext: ' + result;
}

function decryptAuto() {
  let text = document.getElementById('plaintext').value.toUpperCase().replace(/[^A-Z]/g, '');
  let key = document.getElementById('key').value.toUpperCase();
  if (!key) return alert('Key tidak boleh kosong!');
  let result = '';
  for (let i = 0; i < text.length; i++) {
    let currentKey = (i < key.length) ? key[i] : result[i - key.length];
    result += vigenereShift(text[i], currentKey, true);
  }
  document.getElementById('output').innerText = 'Plaintext: ' + result;
}

// ====== EXTENDED VIGENERE (ASCII) ======
function encryptExtended() {
  let text = document.getElementById('plaintext').value;
  let key = document.getElementById('key').value;
  if (!key) return alert('Key tidak boleh kosong!');
  let result = '';
  for (let i = 0; i < text.length; i++) {
    let p = text.charCodeAt(i);
    let k = key.charCodeAt(i % key.length);
    result += String.fromCharCode((p + k) % 256);
  }
  document.getElementById('output').innerText = 'Ciphertext (Base64): ' + btoa(result);
}

function decryptExtended() {
  let cipher = atob(document.getElementById('plaintext').value);
  let key = document.getElementById('key').value;
  if (!key) return alert('Key tidak boleh kosong!');
  let result = '';
  for (let i = 0; i < cipher.length; i++) {
    let c = cipher.charCodeAt(i);
    let k = key.charCodeAt(i % key.length);
    result += String.fromCharCode((c - k + 256) % 256);
  }
  document.getElementById('output').innerText = 'Plaintext: ' + result;
}

// ====== SUPER ENKRIPSI ======
// Gabungan Extended Vigenere + Transposisi Kolom

function encryptSuper() {
  let text = document.getElementById('plaintext').value;
  let key = document.getElementById('key').value;
  if (!key) return alert('Key tidak boleh kosong!');

  // Step 1: Extended Vigenere Encryption
  let vigResult = '';
  for (let i = 0; i < text.length; i++) {
    let p = text.charCodeAt(i);
    let k = key.charCodeAt(i % key.length);
    vigResult += String.fromCharCode((p + k) % 256);
  }

  // Step 2: Columnar Transposition
  let numCols = key.length;
  let rows = Math.ceil(vigResult.length / numCols);
  let grid = Array.from({ length: rows }, () => Array(numCols).fill(' '));

  let index = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (index < vigResult.length) {
        grid[r][c] = vigResult[index++];
      }
    }
  }

  let sortedKey = [...key].map((c, i) => ({ char: c, index: i }))
    .sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));

  let transposed = '';
  for (let k of sortedKey) {
    for (let r = 0; r < rows; r++) {
      transposed += grid[r][k.index];
    }
  }

  document.getElementById('output').innerText = 'Super Cipher (Base64): ' + btoa(transposed);
}

function decryptSuper() {
  let cipher = atob(document.getElementById('plaintext').value);
  let key = document.getElementById('key').value;
  if (!key) return alert('Key tidak boleh kosong!');

  // Step 1: Transposisi Balik
  let numCols = key.length;
  let rows = Math.ceil(cipher.length / numCols);

  let sortedKey = [...key].map((c, i) => ({ char: c, index: i }))
    .sort((a, b) => a.char.charCodeAt(0) - b.char.charCodeAt(0));

  let grid = Array.from({ length: rows }, () => Array(numCols).fill(''));
  let index = 0;
  for (let k of sortedKey) {
    for (let r = 0; r < rows; r++) {
      if (index < cipher.length) grid[r][k.index] = cipher[index++];
    }
  }

  let text = grid.flat().join('').trim();

  // Step 2: Extended Vigenere Decryption
  let result = '';
  for (let i = 0; i < text.length; i++) {
    let c = text.charCodeAt(i);
    let k = key.charCodeAt(i % key.length);
    result += String.fromCharCode((c - k + 256) % 256);
  }

  document.getElementById('output').innerText = 'Plaintext: ' + result;
}
// ====== PLAYFAIR CIPHER ======
function generatePlayfairMatrix(key) {
  key = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  let seen = new Set();
  let matrix = [];

  for (let c of key) {
    if (!seen.has(c)) {
      matrix.push(c);
      seen.add(c);
    }
  }

  for (let c of 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
    if (!seen.has(c)) {
      matrix.push(c);
      seen.add(c);
    }
  }

  let table = [];
  for (let i = 0; i < 5; i++) {
    table.push(matrix.slice(i * 5, i * 5 + 5));
  }
  return table;
}

function findPosition(table, letter) {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      if (table[row][col] === letter) return { row, col };
    }
  }
  return null;
}

function playfairEncrypt(plaintext, key) {
  plaintext = plaintext.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  let table = generatePlayfairMatrix(key);

  // Pisahkan jadi pasangan huruf
  let pairs = [];
  for (let i = 0; i < plaintext.length; i += 2) {
    let a = plaintext[i];
    let b = plaintext[i + 1];
    if (!b) b = 'X';
    if (a === b) {
      pairs.push(a + 'X');
      i--;
    } else {
      pairs.push(a + b);
    }
  }

  let result = '';
  for (let pair of pairs) {
    let [a, b] = pair.split('');
    let posA = findPosition(table, a);
    let posB = findPosition(table, b);

    if (posA.row === posB.row) {
      result += table[posA.row][(posA.col + 1) % 5];
      result += table[posB.row][(posB.col + 1) % 5];
    } else if (posA.col === posB.col) {
      result += table[(posA.row + 1) % 5][posA.col];
      result += table[(posB.row + 1) % 5][posB.col];
    } else {
      result += table[posA.row][posB.col];
      result += table[posB.row][posA.col];
    }
  }
  return result;
}

function playfairDecrypt(ciphertext, key) {
  ciphertext = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  let table = generatePlayfairMatrix(key);
  let result = '';

  for (let i = 0; i < ciphertext.length; i += 2) {
    let a = ciphertext[i];
    let b = ciphertext[i + 1];
    let posA = findPosition(table, a);
    let posB = findPosition(table, b);

    if (posA.row === posB.row) {
      result += table[posA.row][(posA.col + 4) % 5];
      result += table[posB.row][(posB.col + 4) % 5];
    } else if (posA.col === posB.col) {
      result += table[(posA.row + 4) % 5][posA.col];
      result += table[(posB.row + 4) % 5][posB.col];
    } else {
      result += table[posA.row][posB.col];
      result += table[posB.row][posA.col];
    }
  }
  return result;
}

function encryptPlayfair() {
  let text = document.getElementById("plaintext").value;
  let key = document.getElementById("key").value;
  if (!key) return alert("Key tidak boleh kosong!");
  let result = playfairEncrypt(text, key);
  document.getElementById("output").innerText = "Ciphertext: " + result;
}

function decryptPlayfair() {
  let text = document.getElementById("plaintext").value;
  let key = document.getElementById("key").value;
  if (!key) return alert("Key tidak boleh kosong!");
  let result = playfairDecrypt(text, key);
  document.getElementById("output").innerText = "Plaintext: " + result;
}

// ====== AFFINE CIPHER ======
function modInverse(a, m) {
  a = ((a % m) + m) % m;
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  return null;
}

function affineEncrypt(plaintext, a, b) {
  plaintext = plaintext.toUpperCase().replace(/[^A-Z]/g, '');
  let result = '';
  for (let char of plaintext) {
    let p = char.charCodeAt(0) - 65;
    let c = (a * p + b) % 26;
    result += String.fromCharCode(c + 65);
  }
  return result;
}

function affineDecrypt(ciphertext, a, b) {
  ciphertext = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
  let inv = modInverse(a, 26);
  if (inv === null) return "a tidak memiliki invers modulo 26!";
  let result = '';
  for (let char of ciphertext) {
    let c = char.charCodeAt(0) - 65;
    let p = (inv * (c - b + 26)) % 26;
    result += String.fromCharCode(p + 65);
  }
  return result;
}

function encryptAffine() {
  let text = document.getElementById("plaintext").value;
  let key = document.getElementById("key").value;
  let parts = key.split(",");
  if (parts.length < 2) return alert("Masukkan kunci dalam format a,b (contoh: 5,8)");
  let a = parseInt(parts[0]);
  let b = parseInt(parts[1]);
  let result = affineEncrypt(text, a, b);
  document.getElementById("output").innerText = "Ciphertext: " + result;
}

function decryptAffine() {
  let text = document.getElementById("plaintext").value;
  let key = document.getElementById("key").value;
  let parts = key.split(",");
  if (parts.length < 2) return alert("Masukkan kunci dalam format a,b (contoh: 5,8)");
  let a = parseInt(parts[0]);
  let b = parseInt(parts[1]);
  let result = affineDecrypt(text, a, b);
  document.getElementById("output").innerText = "Plaintext: " + result;
}
