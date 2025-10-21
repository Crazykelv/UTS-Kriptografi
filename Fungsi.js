
// =====================
//  Cipher Lab – UTS 2025
// =====================

/** UTILITIES */
const Utils = {
  onlyAZ: s => (s.toUpperCase().replace(/[^A-Z]/g, '')),
  toBytes: s => new TextEncoder().encode(s),
  fromBytes: b => new TextDecoder().decode(b),
  toB64: (bytesOrStr) => {
    if (bytesOrStr instanceof Uint8Array) {
      let bin = '';
      bytesOrStr.forEach(x => bin += String.fromCharCode(x));
      return btoa(bin);
    }
    return btoa(bytesOrStr);
  },
  fromB64ToBytes: (b64) => {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i=0;i<bin.length;i++) out[i] = bin.charCodeAt(i);
    return out;
  },
  mod: (a, m) => ((a % m) + m) % m,
  gcd: (a,b)=> b? Utils.gcd(b,a%b):a,
  invMod: (a, m) => {
    a = Utils.mod(a, m);
    for (let x=1;x<m;x++) if ((a*x)%m===1) return x;
    return null;
  },
  download: (filename, bytes) => {
    const blob = new Blob([bytes], {type: "application/octet-stream"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  }
};

/** UI HANDLERS */
const UI = {
  current: "",
  lastBytes: null,           // last raw bytes (cipher or plain) for download
  lastB64: "",               // base64 string (no spaces)
  lastRawText: "",           // raw A-Z text (for classical)
  lastFilename: "cipher.dat",

  switchTab(ev){
    const tg = ev.currentTarget.getAttribute('data-target');
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p=>p.classList.remove('active'));
    ev.currentTarget.classList.add('active');
    document.querySelector(tg).classList.add('active');
  },

  showCipherForm(){
    const sel = document.getElementById('cipherSelect');
    const form = document.getElementById('formDynamic');
    const title = document.getElementById('cipherTitle');
    UI.current = sel.value;
    if(!UI.current){ form.style.display='none'; return; }
    form.style.display='block';

    const names = {
      standard: "Vigenere (Standar, 26 huruf)",
      auto: "Auto‑Key Vigenere (26 huruf)",
      extended: "Extended Vigenere (ASCII)",
      playfair: "Playfair (26 huruf)",
      affine: "Affine (26 huruf)",
      hill: "Hill (26 huruf, 2×2)",
      super: "Super: Extended Vigenere + Transposisi Kolom",
      enigma: "Bonus: Enigma (I‑II‑III, Reflector B)"
    };
    title.textContent = names[UI.current] || "Cipher";

    // render key areas
    UI.renderKeyAreas();
    // reset outputs
    UI.clearOutput();
  },

  renderKeyAreas(){
    const keyArea = document.getElementById('keyArea');
    const keyAreaFile = document.getElementById('keyAreaFile');
    keyArea.innerHTML = "";
    keyAreaFile.innerHTML = "";

    const add = (container, html) => {
      const d = document.createElement('div');
      d.innerHTML = html;
      container.appendChild(d.firstElementChild);
    };

    // Common key field
    if (["standard","auto","extended","super","playfair","enigma"].includes(UI.current)){
      add(keyArea, `<div><label class="label">Key</label><input id="key" class="input" type="text" placeholder="Masukkan key" /></div>`);
      add(keyAreaFile, `<div><label class="label">Key</label><input id="key_file" class="input" type="text" placeholder="Masukkan key" /></div>`);
    }

    if (UI.current==="affine"){
      add(keyArea, `<div class="grid">
        <div><label class="label">a (coprime 26)</label><input id="a" class="input" type="number" value="5" /></div>
        <div><label class="label">b</label><input id="b" class="input" type="number" value="8" /></div>
      </div>`);
      add(keyAreaFile, `<div class="grid">
        <div><label class="label">a (coprime 26)</label><input id="a_file" class="input" type="number" value="5" /></div>
        <div><label class="label">b</label><input id="b_file" class="input" type="number" value="8" /></div>
      </div>`);
    }

    if (UI.current==="hill"){
      add(keyArea, `<div class="grid">
        <div><label class="label">m11</label><input id="m11" class="input" type="number" value="3" /></div>
        <div><label class="label">m12</label><input id="m12" class="input" type="number" value="3" /></div>
        <div><label class="label">m21</label><input id="m21" class="input" type="number" value="2" /></div>
        <div><label class="label">m22</label><input id="m22" class="input" type="number" value="5" /></div>
      </div>`);
      add(keyAreaFile, `<div class="grid">
        <div><label class="label">m11</label><input id="m11_file" class="input" type="number" value="3" /></div>
        <div><label class="label">m12</label><input id="m12_file" class="input" type="number" value="3" /></div>
        <div><label class="label">m21</label><input id="m21_file" class="input" type="number" value="2" /></div>
        <div><label class="label">m22</label><input id="m22_file" class="input" type="number" value="5" /></div>
      </div>`);
    }
  },

  clearText(){
    document.getElementById('plaintext').value="";
    UI.clearOutput();
  },
  clearFile(){
    document.getElementById('fileInput').value=null;
    UI.clearOutput();
  },
  clearOutput(){
    UI.lastBytes = null;
    UI.lastB64 = "";
    UI.lastRawText = "";
    document.getElementById('resultMeta').textContent = "";
    document.getElementById('resultRaw').textContent = "";
    document.getElementById('resultBase64').textContent = "";
  },
  setOutput({rawText, bytes, meta}){
    const metaBox = document.getElementById('resultMeta');
    const rawBox  = document.getElementById('resultRaw');
    const b64Box  = document.getElementById('resultBase64');

    metaBox.textContent = meta || "";
    if (rawText !== undefined){
      UI.lastRawText = rawText;
      rawBox.textContent = "RAW: " + rawText;
      const b64 = Utils.toB64(rawText).replace(/\s+/g,'').toLowerCase();
      UI.lastB64 = b64;
      b64Box.textContent = "BASE64: " + b64;
      UI.lastBytes = new TextEncoder().encode(rawText);
    }
    if (bytes instanceof Uint8Array){
      UI.lastBytes = bytes;
      const decoded = Utils.fromBytes(bytes);
      UI.lastRawText = decoded;
      rawBox.textContent = "RAW: " + decoded;
      const b64 = Utils.toB64(bytes).replace(/\s+/g,'');
      UI.lastB64 = b64;
      b64Box.textContent = "BASE64: " + b64;
    }
  },
  copyRaw(){
    const text = UI.lastRawText || (UI.lastBytes ? Utils.fromBytes(UI.lastBytes) : "");
    navigator.clipboard.writeText(text || "").then(()=>{});
  },
  copyB64(){
    navigator.clipboard.writeText(UI.lastB64 || "").then(()=>{});
  },
  download(){
    if(!UI.lastBytes){ alert("Belum ada hasil untuk diunduh."); return; }
    Utils.download(UI.lastFilename, UI.lastBytes);
  }
};

/** CORE CIPHERS */
const Classical = {
  // Vigenere helper for single letter
  shift(ch, keyCh, dec=false){
    const p = ch.charCodeAt(0)-65;
    const k = keyCh.charCodeAt(0)-65;
    const c = dec? Utils.mod(p-k,26) : (p+k)%26;
    return String.fromCharCode(c+65);
  },

  vigenereEncrypt(text, key){
    text = Utils.onlyAZ(text);
    key  = Utils.onlyAZ(key);
    if(!key) throw new Error("Key wajib diisi.");
    let out="";
    for(let i=0;i<text.length;i++)
      out += Classical.shift(text[i], key[i%key.length], false);
    return out;
  },
  vigenereDecrypt(text, key){
    text = Utils.onlyAZ(text);
    key  = Utils.onlyAZ(key);
    if(!key) throw new Error("Key wajib diisi.");
    let out="";
    for(let i=0;i<text.length;i++)
      out += Classical.shift(text[i], key[i%key.length], true);
    return out;
  },

  autoKeyEncrypt(text, key){
    text = Utils.onlyAZ(text);
    key  = Utils.onlyAZ(key);
    if(!key) throw new Error("Key wajib diisi.");
    let full = (key + text).slice(0, text.length);
    let out="";
    for(let i=0;i<text.length;i++) out += Classical.shift(text[i], full[i], false);
    return out;
  },
  autoKeyDecrypt(text, key){
    text = Utils.onlyAZ(text);
    key  = Utils.onlyAZ(key);
    if(!key) throw new Error("Key wajib diisi.");
    let out="";
    for(let i=0;i<text.length;i++){
      const kch = (i<key.length) ? key[i] : out[i-key.length];
      out += Classical.shift(text[i], kch, true);
    }
    return out;
  },

  // Playfair
  playfairPrepareKey(key){
    key = Utils.onlyAZ(key).replace(/J/g,"I");
    let seen = new Set(), seq=[];
    for (const ch of key){ if(!seen.has(ch)){ seen.add(ch); seq.push(ch);} }
    for (let c=65;c<=90;c++){
      const ch = String.fromCharCode(c);
      if (ch==="J") continue;
      if(!seen.has(ch)){ seen.add(ch); seq.push(ch); }
    }
    const grid = [];
    for (let i=0;i<25;i+=5) grid.push(seq.slice(i,i+5));
    return grid;
  },
  playfairFind(grid, ch){
    for (let r=0;r<5;r++) for(let c=0;c<5;c++) if(grid[r][c]===ch) return [r,c];
    return [-1,-1];
  },
  playfairPairs(text){
    text = Utils.onlyAZ(text).replace(/J/g,"I");
    let out=[];
    for(let i=0;i<text.length;i++){
      const a=text[i], b=text[i+1];
      if (!b){ out.push([a,"X"]); break; }
      if (a===b){ out.push([a,"X"]); }
      else { out.push([a,b]); i++; }
    }
    if (out.length && out[out.length-1][1]==="X" && out.length%2!==0) out.push(["X","Z"]);
    return out;
  },
  playfairEncrypt(text, key){
    const grid = Classical.playfairPrepareKey(key);
    const pairs = Classical.playfairPairs(text);
    let res="";
    for(const [a,b] of pairs){
      let [r1,c1]=Classical.playfairFind(grid,a);
      let [r2,c2]=Classical.playfairFind(grid,b);
      if(r1===r2){
        res += grid[r1][(c1+1)%5] + grid[r2][(c2+1)%5];
      } else if(c1===c2){
        res += grid[(r1+1)%5][c1] + grid[(r2+1)%5][c2];
      } else {
        res += grid[r1][c2] + grid[r2][c1];
      }
    }
    return res;
  },
  playfairDecrypt(text, key){
    const grid = Classical.playfairPrepareKey(key);
    const pairs = Classical.playfairPairs(text); // use pairing on ciphertext length-safe
    let res="";
    for(const [a,b] of pairs){
      let [r1,c1]=Classical.playfairFind(grid,a);
      let [r2,c2]=Classical.playfairFind(grid,b);
      if(r1===r2){
        res += grid[r1][(c1+4)%5] + grid[r2][(c2+4)%5];
      } else if(c1===c2){
        res += grid[(r1+4)%5][c1] + grid[(r2+4)%5][c2];
      } else {
        res += grid[r1][c2] + grid[r2][c1];
      }
    }
    return res;
  },

  // Affine
  affineEncrypt(text, a, b){
    text = Utils.onlyAZ(text);
    if (Utils.gcd(a,26)!==1) throw new Error("a harus relatif prima dengan 26.");
    let out="";
    for (const ch of text){
      const p = ch.charCodeAt(0)-65;
      const c = Utils.mod(a*p + b, 26);
      out += String.fromCharCode(c+65);
    }
    return out;
  },
  affineDecrypt(text, a, b){
    text = Utils.onlyAZ(text);
    const invA = Utils.invMod(a,26);
    if (invA===null) throw new Error("a tidak memiliki invers modulo 26.");
    let out="";
    for (const ch of text){
      const c = ch.charCodeAt(0)-65;
      const p = Utils.mod(invA*(c - b), 26);
      out += String.fromCharCode(p+65);
    }
    return out;
  },

  // Hill 2x2
  hillEncrypt(text, m){
    text = Utils.onlyAZ(text);
    if (text.length%2===1) text += "X";
    const det = m[0][0]*m[1][1] - m[0][1]*m[1][0];
    if (Utils.gcd(det,26)!==1) throw new Error("Matriks tidak invertible modulo 26.");
    let out="";
    for (let i=0;i<text.length;i+=2){
      const p1 = text.charCodeAt(i)-65;
      const p2 = text.charCodeAt(i+1)-65;
      const c1 = Utils.mod(m[0][0]*p1 + m[0][1]*p2, 26);
      const c2 = Utils.mod(m[1][0]*p1 + m[1][1]*p2, 26);
      out += String.fromCharCode(c1+65) + String.fromCharCode(c2+65);
    }
    return out;
  },
  hillDecrypt(text, m){
    text = Utils.onlyAZ(text);
    if (text.length%2===1) throw new Error("Panjang ciphertext harus genap.");
    const det = Utils.mod(m[0][0]*m[1][1] - m[0][1]*m[1][0], 26);
    const invDet = Utils.invMod(det, 26);
    if (invDet===null) throw new Error("Matriks tidak invertible modulo 26.");
    const inv = [
      [ Utils.mod( m[1][1]*invDet, 26), Utils.mod((-m[0][1])*invDet, 26) ],
      [ Utils.mod((-m[1][0])*invDet, 26), Utils.mod( m[0][0]*invDet, 26) ],
    ];
    let out="";
    for (let i=0;i<text.length;i+=2){
      const c1 = text.charCodeAt(i)-65;
      const c2 = text.charCodeAt(i+1)-65;
      const p1 = Utils.mod(inv[0][0]*c1 + inv[0][1]*c2, 26);
      const p2 = Utils.mod(inv[1][0]*c1 + inv[1][1]*c2, 26);
      out += String.fromCharCode(p1+65) + String.fromCharCode(p2+65);
    }
    return out;
  }
};

const Extended = {
  vigenereBytes(bytes, keyBytes, dec=false){
    const out = new Uint8Array(bytes.length);
    for (let i=0;i<bytes.length;i++){
      const p = bytes[i], k = keyBytes[i % keyBytes.length];
      out[i] = dec ? ((p - k + 256) % 256) : ((p + k) % 256);
    }
    return out;
  },

  // Columnar transposition on bytes using key (sort by charCode, stable with index)
  columnarEncrypt(bytes, key){
    const n = key.length;
    const rows = Math.ceil(bytes.length / n);
    const grid = Array.from({length: rows}, ()=> new Array(n).fill(32)); // pad with space (32)
    let idx=0;
    for (let r=0;r<rows;r++)
      for (let c=0;c<n;c++)
        if (idx<bytes.length) grid[r][c]=bytes[idx++];
    const perm = [...key].map((c,i)=>({c, i})).sort((a,b)=> a.c.charCodeAt(0)-b.c.charCodeAt(0));
    const out = [];
    for (const k of perm) for (let r=0;r<rows;r++) out.push(grid[r][k.i]);
    return new Uint8Array(out);
  },
  columnarDecrypt(bytes, key){
    const n = key.length;
    const rows = Math.ceil(bytes.length / n);
    const perm = [...key].map((c,i)=>({c,i})).sort((a,b)=> a.c.charCodeAt(0)-b.c.charCodeAt(0));
    const grid = Array.from({length: rows}, ()=> new Array(n).fill(0));
    let idx=0;
    for (const k of perm){
      for (let r=0;r<rows;r++){
        if (idx<bytes.length) grid[r][k.i] = bytes[idx++];
      }
    }
    const out=[];
    for (let r=0;r<rows;r++) for (let c=0;c<n;c++) out.push(grid[r][c]);
    return new Uint8Array(out);
  }
};

/** BONUS – Minimal Enigma (I-II-III, Reflector B, no plugboard, ring=01) */
const Enigma = (()=>{
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const rotor = {
    I:   {w:"EKMFLGDQVZNTOWYHXUSPAIBRCJ", notch:"Q"},
    II:  {w:"AJDKSIRUXBLHWTMCQGZNPYFVOE", notch:"E"},
    III: {w:"BDFHJLCPRTXVZNYEIWGAKMUSQO", notch:"V"},
  };
  const reflB = "YRUHQSLDPXNGOKMIEBFZCWVJAT";
  function encIndex(ch){ return ch.charCodeAt(0)-65; }
  function encThrough(wiring, i){ return wiring.charCodeAt(i)-65; }
  function encInverse(wiring, i){ return wiring.indexOf(String.fromCharCode(i+65)); }

  function step(pos, notch){
    // pos 0..25; notch letter rotates next rotor when leaving notch
    // handled in run step logic
    return (pos+1)%26;
  }

  return {
    run(text, key){ // key: "ABC" -> left,right positions start
      text = Utils.onlyAZ(text);
      if (!/^[A-Z]{3}$/.test(key)) throw new Error("Key Enigma harus 3 huruf (mis. QWE).");
      let [L,M,R] = [key.charCodeAt(0)-65, key.charCodeAt(1)-65, key.charCodeAt(2)-65];
      let out="";
      for (const ch of text){
        // double-stepping (simplified)
        const notchL = rotor.I.notch.charCodeAt(0)-65;
        const notchM = rotor.II.notch.charCodeAt(0)-65;
        const notchR = rotor.III.notch.charCodeAt(0)-65;

        // middle steps when at notch, right always steps
        if (M === notchM) { M = step(M); L = step(L); }
        if (R === notchR) { M = step(M); }
        R = step(R);

        let i = encIndex(ch);
        // right to left (with rotor positions)
        i = Utils.mod(i + R,26); i = encThrough(rotor.III.w, i); i = Utils.mod(i - R,26);
        i = Utils.mod(i + M,26); i = encThrough(rotor.II.w,  i); i = Utils.mod(i - M,26);
        i = Utils.mod(i + L,26); i = encThrough(rotor.I.w,   i); i = Utils.mod(i - L,26);
        // reflector
        i = encThrough(reflB, i);
        // back left to right (inverse)
        i = Utils.mod(i + L,26); i = encInverse(rotor.I.w,   i); i = Utils.mod(i - L,26);
        i = Utils.mod(i + M,26); i = encInverse(rotor.II.w,  i); i = Utils.mod(i - M,26);
        i = Utils.mod(i + R,26); i = encInverse(rotor.III.w, i); i = Utils.mod(i - R,26);

        out += String.fromCharCode(i+65);
      }
      return out;
    }
  }
})();

/** APP LAYER */
const App = {
  encryptText(){
    try{
      const mode = UI.current;
      if(!mode) return alert("Pilih cipher terlebih dahulu.");
      let raw="", meta="";
      const txt = document.getElementById('plaintext').value;
      if (!txt.trim()) return alert("Masukkan plaintext/ciphertext.");
      switch(mode){
        case "standard": {
          const key = document.getElementById('key').value;
          raw = Classical.vigenereEncrypt(txt, key); meta="Vigenere (ENCRYPT)";
          break;
        }
        case "auto": {
          const key = document.getElementById('key').value;
          raw = Classical.autoKeyEncrypt(txt, key); meta="Auto‑Key Vigenere (ENCRYPT)";
          break;
        }
        case "extended": {
          const key = document.getElementById('key').value;
          const out = Extended.vigenereBytes(Utils.toBytes(txt), Utils.toBytes(key), false);
          UI.lastFilename = "cipher.dat";
          UI.setOutput({bytes: out, meta:"Extended Vigenere (ENCRYPT)"});
          return;
        }
        case "playfair":{
          const key = document.getElementById('key').value;
          raw = Classical.playfairEncrypt(txt, key); meta="Playfair (ENCRYPT)";
          break;
        }
        case "affine":{
          const a = parseInt(document.getElementById('a').value,10);
          const b = parseInt(document.getElementById('b').value,10);
          raw = Classical.affineEncrypt(txt, a, b); meta=`Affine (ENCRYPT) a=${a}, b=${b}`;
          break;
        }
        case "hill":{
          const m = [
            [parseInt(document.getElementById('m11').value,10), parseInt(document.getElementById('m12').value,10)],
            [parseInt(document.getElementById('m21').value,10), parseInt(document.getElementById('m22').value,10)]
          ];
          raw = Classical.hillEncrypt(txt, m); meta=`Hill 2×2 (ENCRYPT)`;
          break;
        }
        case "super":{
          const key = document.getElementById('key').value;
          // step1 extended
          const vig = Extended.vigenereBytes(Utils.toBytes(txt), Utils.toBytes(key), false);
          // step2 transposisi kolom (bytes)
          const trans = Extended.columnarEncrypt(vig, key);
          UI.lastFilename = "super_cipher.dat";
          UI.setOutput({bytes: trans, meta:"Super (ENCRYPT) Extended+Transposisi"});
          return;
        }
        case "enigma":{
          const key = document.getElementById('key').value;
          raw = Enigma.run(txt, Utils.onlyAZ(key)); meta="Enigma (ENCRYPT/Simetrik)";
          break;
        }
      }
      UI.lastFilename = "cipher.txt";
      UI.setOutput({rawText:raw, meta});
    }catch(e){ alert(e.message); }
  },

  decryptText(){
    try{
      const mode = UI.current;
      if(!mode) return alert("Pilih cipher terlebih dahulu.");
      let raw="", meta="";
      const txt = document.getElementById('plaintext').value;
      if (!txt.trim()) return alert("Masukkan plaintext/ciphertext.");
      switch(mode){
        case "standard": {
          const key = document.getElementById('key').value;
          raw = Classical.vigenereDecrypt(txt, key); meta="Vigenere (DECRYPT)";
          break;
        }
        case "auto": {
          const key = document.getElementById('key').value;
          raw = Classical.autoKeyDecrypt(txt, key); meta="Auto‑Key Vigenere (DECRYPT)";
          break;
        }
        case "extended": {
          const key = document.getElementById('key').value;
          // assume input is base64 of bytes
          const bytes = Utils.fromB64ToBytes(txt.replace(/\s+/g,''));
          const out = Extended.vigenereBytes(bytes, Utils.toBytes(key), true);
          UI.lastFilename = "plain.bin";
          UI.setOutput({bytes: out, meta:"Extended Vigenere (DECRYPT)"});
          return;
        }
        case "playfair":{
          const key = document.getElementById('key').value;
          raw = Classical.playfairDecrypt(txt, key); meta="Playfair (DECRYPT)";
          break;
        }
        case "affine":{
          const a = parseInt(document.getElementById('a').value,10);
          const b = parseInt(document.getElementById('b').value,10);
          raw = Classical.affineDecrypt(txt, a, b); meta=`Affine (DECRYPT) a=${a}, b=${b}`;
          break;
        }
        case "hill":{
          const m = [
            [parseInt(document.getElementById('m11').value,10), parseInt(document.getElementById('m12').value,10)],
            [parseInt(document.getElementById('m21').value,10), parseInt(document.getElementById('m22').value,10)]
          ];
          raw = Classical.hillDecrypt(txt, m); meta=`Hill 2×2 (DECRYPT)`;
          break;
        }
        case "super":{
          const key = document.getElementById('key').value;
          // inverse transposisi
          const bytes = Utils.fromB64ToBytes(txt.replace(/\s+/g,''));
          const detr = Extended.columnarDecrypt(bytes, key);
          const devig = Extended.vigenereBytes(detr, Utils.toBytes(key), true);
          UI.lastFilename = "plain.bin";
          UI.setOutput({bytes: devig, meta:"Super (DECRYPT) Extended+Transposisi"});
          return;
        }
        case "enigma":{
          const key = document.getElementById('key').value;
          raw = Enigma.run(txt, Utils.onlyAZ(key)); meta="Enigma (DECRYPT/Simetrik)";
          break;
        }
      }
      UI.lastFilename = "plain.txt";
      UI.setOutput({rawText:raw, meta});
    }catch(e){ alert(e.message); }
  },

  async encryptFile(){
    try{
      const mode = UI.current;
      if(!mode) return alert("Pilih cipher terlebih dahulu.");
      const f = document.getElementById('fileInput').files[0];
      if(!f) return alert("Pilih file terlebih dahulu.");
      const buf = new Uint8Array(await f.arrayBuffer());
      UI.lastFilename = (f.name || "cipher") + ".dat";

      if (mode==="extended" || mode==="super"){
        const key = (document.getElementById('key_file')||{}).value || "";
        if (!key) throw new Error("Key wajib diisi.");
        const step1 = Extended.vigenereBytes(buf, Utils.toBytes(key), false);
        const res = (mode==="super") ? Extended.columnarEncrypt(step1, key) : step1;
        UI.setOutput({bytes: res, meta: (mode==="super" ? "Super (ENCRYPT) file" : "Extended (ENCRYPT) file")});
      } else {
        // treat as text (A-Z only) – not recommended for binary
        const asText = new TextDecoder().decode(buf);
        let raw="";
        switch(mode){
          case "standard": raw = Classical.vigenereEncrypt(asText, (document.getElementById('key_file')||{}).value||""); break;
          case "auto":     raw = Classical.autoKeyEncrypt(asText, (document.getElementById('key_file')||{}).value||""); break;
          case "playfair": raw = Classical.playfairEncrypt(asText, (document.getElementById('key_file')||{}).value||""); break;
          case "affine":   raw = Classical.affineEncrypt(asText, parseInt((document.getElementById('a_file')||{}).value||"5",10), parseInt((document.getElementById('b_file')||{}).value||"8",10)); break;
          case "hill":     raw = Classical.hillEncrypt(asText, [[parseInt((document.getElementById('m11_file')||{}).value||"3",10), parseInt((document.getElementById('m12_file')||{}).value||"3",10)],[parseInt((document.getElementById('m21_file')||{}).value||"2",10), parseInt((document.getElementById('m22_file')||{}).value||"5",10)]]); break;
          case "enigma":   raw = Enigma.run(asText, Utils.onlyAZ((document.getElementById('key_file')||{}).value||"AAA")); break;
        }
        UI.lastFilename = "cipher.txt";
        UI.setOutput({rawText: raw, meta: `Mode ${mode} (ENCRYPT) – file diperlakukan sebagai teks A‑Z`});
      }
    }catch(e){ alert(e.message); }
  },

  async decryptFile(){
    try{
      const mode = UI.current;
      if(!mode) return alert("Pilih cipher terlebih dahulu.");
      const f = document.getElementById('fileInput').files[0];
      if(!f) return alert("Pilih file terlebih dahulu.");
      const buf = new Uint8Array(await f.arrayBuffer());

      if (mode==="extended" || mode==="super"){
        const key = (document.getElementById('key_file')||{}).value || "";
        if (!key) throw new Error("Key wajib diisi.");
        const step1 = (mode==="super") ? Extended.columnarDecrypt(buf, key) : buf;
        const res = Extended.vigenereBytes(step1, Utils.toBytes(key), true);
        UI.lastFilename = "plain_" + (f.name.replace(/\.dat$/i,'') || "file");
        UI.setOutput({bytes: res, meta: (mode==="super" ? "Super (DECRYPT) file" : "Extended (DECRYPT) file")});
      } else {
        const asText = new TextDecoder().decode(buf);
        let raw="";
        switch(mode){
          case "standard": raw = Classical.vigenereDecrypt(asText, (document.getElementById('key_file')||{}).value||""); break;
          case "auto":     raw = Classical.autoKeyDecrypt(asText, (document.getElementById('key_file')||{}).value||""); break;
          case "playfair": raw = Classical.playfairDecrypt(asText, (document.getElementById('key_file')||{}).value||""); break;
          case "affine":   raw = Classical.affineDecrypt(asText, parseInt((document.getElementById('a_file')||{}).value||"5",10), parseInt((document.getElementById('b_file')||{}).value||"8",10)); break;
          case "hill":     raw = Classical.hillDecrypt(asText, [[parseInt((document.getElementById('m11_file')||{}).value||"3",10), parseInt((document.getElementById('m12_file')||{}).value||"3",10)],[parseInt((document.getElementById('m21_file')||{}).value||"2",10), parseInt((document.getElementById('m22_file')||{}).value||"5",10)]]); break;
          case "enigma":   raw = Enigma.run(asText, Utils.onlyAZ((document.getElementById('key_file')||{}).value||"AAA")); break;
        }
        UI.lastFilename = "plain.txt";
        UI.setOutput({rawText: raw, meta: `Mode ${mode} (DECRYPT) – file diperlakukan sebagai teks A‑Z`});
      }
    }catch(e){ alert(e.message); }
  }
};
