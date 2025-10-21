# UTS-Kriptografi
## Anggota :
- Riskyta 227006050 <br>
- Fahri Aminuddin Abdillah 227006051 <br>
- Faiq Pataya Zain 227006052 <br>
Program ini merupakan aplikasi web interaktif untuk mengerjakan seluruh soal UTS mata kuliah
Kriptografi tahun 2025. Aplikasi ini dibuat dengan menggunakan HTML, CSS, dan JavaScript
murni tanpa framework tambahan. Tugas ini mencakup semua algoritma cipher klasik dan modern
sederhana sebagaimana diminta dalam soal : <br>
- Vigenere Cipher <br>
- Auto-Key Vigenere Cipher <br>
- Extended Vigenere Cipher (ASCII 256) <br>
- Playfair Cipher (5x5 grid) <br>
- Affine Cipher <br>
- Hill Cipher <br>
- Enigma Rotor I, II, III, Reflector B, Simetrik
## Fitur Utama
- Dapat mengenkripsi dan mendekripsi baik teks maupun file <br>
- Tampilan hasil dalam format RAW (teks) dan BASE64 (untuk salin) <br>
- Mendukung download hasil enkripsi sebagai file (.dat atau .txt) <br>
- Validasi otomatis parameter seperti nilai a,b Hill/affine dan kunci Enigma <br>
- Desain responsif, nyaman digunakan di laptop atau ponsel <br>
## Cara Penggunaan
1. Buka file index.html di browser (Chrome/Edge/Firefox) <br>
2. Pilih algoritma Cipher dari dropdown <br>
3. Pilih tab: ■ Teks untuk input teks atau ■ File untuk input file <br>
4. Masukkan key/parameter (contoh: key='DEWA', a=5, b=8, matriks=3 3; 2 5, dll) <br>
5. Ketik plaintext atau pilih file yang ingin dienkripsi <br>
6. Klik tombol Encrypt atau Decrypt sesuai kebutuhan <br>
7. Lihat hasil pada panel kanan (RAW & BASE64) <br>
8. Gunakan tombol Copy atau Download untuk menyimpan hasil <br>
## Catatan Penggunaan File
Untuk cipher berbasis alfabet (Vigenere, Auto-Key, Playfair, Affine, Hill, Enigma), hanya huruf A–Z
yang diproses. Karakter lain diabaikan. Untuk file biner (gambar, PDF, dokumen), gunakan cipher
Extended atau Super agar semua byte terenkripsi. File hasil enkripsi tidak akan bisa dibuka
sampai didekripsi kembali. <br>
## Struktur File
• index.html – Tampilan utama antarmuka web <br>
• style.css – Desain visual modern menggunakan tema gelap <br>
• Fungsi.js – Seluruh logika cipher, validasi, dan UI interaktif <br>
• README_UTS_Kriptografi.pdf – Panduan penggunaan program <br>
## Penutup
Aplikasi ini dibuat untuk memenuhi dan menyelesaikan seluruh poin soal UTS Kriptografi 2025.
Semua algoritma diuji bekerja dua arah (enkripsi dan dekripsi) serta kompatibel untuk teks dan file <br>
