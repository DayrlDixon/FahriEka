document.addEventListener('DOMContentLoaded', () => {

    // --- Konfigurasi Firebase Anda ---
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

    // --- 1. Fungsi Buka Undangan ---
    openBtn.addEventListener('click', () => {
        cover.style.opacity = '0';
        setTimeout(() => cover.style.display = 'none', 1000);
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
        const targetDate = new Date('2030-10-05T10:00:00').getTime();
        const interval = setInterval(() => {
            const distance = targetDate - new Date().getTime();
            if (distance < 0) {
                clearInterval(interval);
                el.innerHTML = `<p>Acara Telah Berlangsung</p>`;
                return;
            }
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            el.innerHTML = `<div>${d}<span>Hari</span></div><div>${h}<span>Jam</span></div><div>${m}<span>Menit</span></div>`;
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
                formPesan.value = '';
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
            // Panggil kembali fungsi animasi agar entri baru juga mendapat animasi
            setupScrollAnimations();
        });
    };

    // --- 5. Fungsi Navigasi, Musik, dan Salin (DIKEMBALIKAN) ---
    const setupOtherFeatures = () => {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('.bottom-nav a');
        const navObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`.bottom-nav a[href="#${entry.target.id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, { rootMargin: '-50% 0px -50% 0px' });
        sections.forEach(section => navObserver.observe(section));

        musicBtn.addEventListener('click', () => {
            bgMusic.paused ? (bgMusic.play(), musicBtn.classList.
