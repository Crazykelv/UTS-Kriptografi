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
    default: alert("Pilih cipher terlebih dahulu!");
  }
}

function handleDecrypt() {
  switch (currentCipher) {
    case "standard": decryptStandard(); break;
    case "auto": decryptAuto(); break;
    case "extended": decryptExtended(); break;
    case "super": decryptSuper(); break;
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
