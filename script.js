document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // TAMBAHAN: Konfigurasi Firebase untuk RSVP Publik
    // GANTI DENGAN KODE KONFIGURASI DARI PROYEK FIREBASE ANDA
    // ===================================================================
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
    apiKey: "AIzaSyB8w9DuSXm-G2m94K7uAc3JTVDXslgcqQw",
    authDomain: "fahrieka-6b2c2.firebaseapp.com",
    databaseURL: "https://fahrieka-6b2c2-default-rtdb.firebaseio.com",
    projectId: "fahrieka-6b2c2",
    storageBucket: "fahrieka-6b2c2.firebasestorage.app",
    messagingSenderId: "462028758444",
    appId: "1:462028758444:web:eee0dd1138c1ab622d6e09",
    measurementId: "G-7SWHK0WWY2"
    };

    // Inisialisasi Firebase
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    const guestbookRef = database.ref('guestbook');
    // ===================================================================

    // --- Pemilihan Elemen DOM ---
    const cover = document.getElementById('cover');
    const openBtn = document.getElementById('openBtn');
    const content = document.getElementById('content');
    const bottomNav = document.querySelector('.bottom-nav');
    const guestNameElement = document.querySelector('#cover-guest .guest-name');
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');

    // --- 1. Fungsi Buka Undangan ---
    openBtn.addEventListener('click', () => {
        cover.style.opacity = '0';
        setTimeout(() => cover.style.display = 'none', 1000);
        content.classList.remove('hidden');
        bottomNav.classList.remove('hidden');
        musicBtn.classList.remove('hidden');
        bgMusic.play().catch(e => console.log("Autoplay diblokir"));
        musicBtn.classList.add('playing');
        document.body.style.overflow = 'auto';
    });

    // --- 2. Fungsi Parsing Nama Tamu ---
    const parseGuestName = () => {
        const params = new URLSearchParams(window.location.search);
        const name = params.get('nama') || params.get('to');
        if (name) {
            const guestName = name.replace(/[+_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            guestNameElement.textContent = guestName;
            document.getElementById('form-nama').value = guestName;
        }
    };

    // --- 3. Fungsi Countdown Timer ---
    const startCountdown = () => {
        const el = document.getElementById('countdown');
        if (!el) return;
        const targetDate = new Date('2030-10-05T10:00:00').getTime();
        const interval = setInterval(() => {
            const distance = targetDate - new Date().getTime();
            if (distance < 0) { clearInterval(interval); el.innerHTML = `<p>Acara Telah Berlangsung</p>`; return; }
            const d = Math.floor(distance / (1000 * 60 * 60 * 24));
            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            el.innerHTML = `<div>${d}<span>Hari</span></div><div>${h}<span>Jam</span></div><div>${m}<span>Menit</span></div>`;
        }, 1000);
    };

    // ===================================================================
    // MODIFIKASI: Fungsi Form Ucapan & Guestbook diubah menggunakan Firebase
    // ===================================================================
    const rsvpForm = document.getElementById('rsvp-form');
    const guestbookList = document.getElementById('guestbook-list');

    // Fungsi untuk menampilkan data dari Firebase
    const renderGuestbook = () => {
        guestbookRef.on('value', (snapshot) => {
            guestbookList.innerHTML = ''; // Kosongkan daftar sebelum render ulang
            const entries = [];
            snapshot.forEach((childSnapshot) => {
                entries.push(childSnapshot.val());
            });
            // Tampilkan komentar terbaru di atas
            guestbookList.innerHTML = entries.reverse().map(entry => {
                const statusClass = entry.konfirmasi.toLowerCase().replace(' ', '-');
                return `<div class="guestbook-entry animate-up">
                            <div class="name">
                                <span>${entry.nama}</span>
                                <span class="status ${statusClass}">${entry.konfirmasi}</span>
                            </div>
                            <p class="message">"${entry.pesan}"</p>
                        </div>`;
            }).join('');
            // Jalankan lagi observer agar entri baru juga mendapat animasi
            setupScrollAnimations();
        });
    };

    // Fungsi untuk mengirim data ke Firebase
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newEntry = {
            nama: document.getElementById('form-nama').value,
            konfirmasi: document.getElementById('form-konfirmasi').value,
            pesan: document.getElementById('form-pesan').value
        };

        // Kirim data ke Firebase
        guestbookRef.push(newEntry).then(() => {
            // Setelah berhasil, reset form
            rsvpForm.reset();
            // Kembalikan nama tamu dari URL jika ada
            const params = new URLSearchParams(window.location.search);
            const name = params.get('nama') || params.get('to');
            if (name) document.getElementById('form-nama').value = name.replace(/[+_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }).catch(error => {
            console.error("Gagal mengirim data: ", error);
        });
    });
    // ===================================================================


    // --- 5. Fungsi Navigasi, Musik, dan Salin ---
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
            bgMusic.paused ? (bgMusic.play(), musicBtn.classList.add('playing')) : (bgMusic.pause(), musicBtn.classList.remove('playing'));
        });

        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', () => {
                const textToCopy = document.getElementById(button.dataset.target).textContent;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const notif = document.getElementById('copy-notification');
                    notif.classList.remove('hidden');
                    setTimeout(() => notif.classList.add('hidden'), 2000);
                });
            });
        });
    };
    
    // ===================================================================
    // MODIFIKASI: Fungsi Animasi Scroll agar berjalan berulang
    // ===================================================================
    const setupScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('[class*="animate-"]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    entry.target.classList.remove('visible');
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    };
    // ===================================================================

    // --- Panggil Semua Fungsi Inisialisasi ---
    parseGuestName();
    startCountdown();
    renderGuestbook(); // Fungsi ini sekarang akan memuat data dari Firebase
    setupOtherFeatures();
    setupScrollAnimations();
});