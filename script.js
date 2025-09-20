document.addEventListener('DOMContentLoaded', () => {

    // --- GANTI DENGAN KONFIGURASI FIREBASE ANDA ---
    const firebaseConfig = {
      apiKey: "AIzaSyB8w9DuSXm-G2m94K7uAc3JTVDXslgcqQw",
      authDomain: "fahrieka-6b2c2.firebaseapp.com",
      databaseURL: "https://fahrieka-6b2c2-default-rtdb.firebaseio.com",
      projectId: "fahrieka-6b2c2",
      storageBucket: "fahrieka-6b2c2.appspot.com",
      messagingSenderId: "462028758444",
      appId: "1:462028758444:web:eee0dd1138c1ab622d6e09"
    };

    // --- Inisialisasi Firebase ---
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const guestbookRef = database.ref('guestbook');

    // --- Pemilihan Elemen DOM ---
    const cover = document.getElementById('cover');
    const openBtn = document.getElementById('openBtn');
    const content = document.getElementById('content');
    const bottomNav = document.querySelector('.bottom-nav');
    const guestNameElement = document.querySelector('#cover-guest .guest-name');
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    const guestbookForm = document.getElementById('guestbook-form');
    const guestbookList = document.getElementById('guestbook-list');
    const formNama = document.getElementById('form-nama');
    const formPesan = document.getElementById('form-pesan');


    // --- 1. Fungsi Buka Undangan (INI AKAN BERFUNGSI KEMBALI) ---
    openBtn.addEventListener('click', () => {
        cover.style.opacity = '0';
        setTimeout(() => cover.style.display = 'none', 1000); // Ganti ke display none agar tidak menghalangi
        content.classList.remove('hidden');
        bottomNav.classList.remove('hidden');
        musicBtn.classList.remove('hidden');
        bgMusic.play().catch(e => console.log("Autoplay diblokir oleh browser."));
        musicBtn.classList.add('playing');
        document.body.style.overflow = 'auto';
    });

    // --- 2. Fungsi Parsing Nama Tamu dari URL ---
    const parseGuestName = () => {
        const params = new URLSearchParams(window.location.search);
        const name = params.get('nama') || params.get('to');
        if (name) {
            const guestName = name.replace(/[+_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            guestNameElement.textContent = guestName;
            formNama.value = guestName;
        }
    };

    // --- 3. Fungsi Countdown Timer ---
    const startCountdown = () => {
        const el = document.getElementById('countdown');
        if (!el) return;
        // Tanggal acara yang sudah lewat (berdasarkan interaksi sebelumnya)
        // Jika ingin mengganti, ubah tanggal di bawah ini
        const targetDate = new Date('2025-10-05T10:00:00').getTime(); 
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                clearInterval(interval);
                el.innerHTML = `<p>Acara Telah Berlangsung</p>`;
                return;
            }
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000); // Menambahkan detik
            el.innerHTML = `<div>${d}<span>Hari</span></div><div>${h}<span>Jam</span></div><div>${m}<span>Menit</span></div><div>${s}<span>Detik</span></div>`;
        }, 1000);
    };

    // --- 4. Fungsi Guestbook dengan Firebase ---
    guestbookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEntry = {
            nama: formNama.value.trim(),
            pesan: formPesan.value.trim(),
            timestamp: new Date().toISOString()
        };
        
        if (!newEntry.nama || !newEntry.pesan) {
            alert("Nama dan pesan tidak boleh kosong.");
            return;
        }

        guestbookRef.push(newEntry)
            .then(() => {
                formPesan.value = ''; // Kosongkan kolom pesan setelah terkirim
            })
            .catch((error) => {
                console.error("Gagal mengirim ucapan: ", error);
                alert("Gagal mengirim ucapan, silakan coba lagi.");
            });
    });

    const renderGuestbook = () => {
        guestbookRef.on('value', (snapshot) => {
            guestbookList.innerHTML = '';
            const entries = [];
            snapshot.forEach((childSnapshot) => {
                entries.push(childSnapshot.val());
            });
            guestbookList.innerHTML = entries.reverse().map(entry => {
                return `<div class="guestbook-entry">
                            <div class="name">${entry.nama}</div>
                            <p class="message">"${entry.pesan}"</p>
                        </div>`;
            }).join('');
        });
    };
    
    // --- Panggil Semua Fungsi Inisialisasi ---
    parseGuestName();
    startCountdown();
    renderGuestbook();
});
