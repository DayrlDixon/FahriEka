document.addEventListener('DOMContentLoaded', () => {

    // --- GANTI URL INI ---
    // Tempel (paste) URL Web App yang Anda dapat dari Langkah 2 di sini
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbyMcPi2E7bpRe2iQYPhfrUSSwCMpVlL5WdtKq5sjsQLDYxD_MURo4YBY3c8R2T2P7u6/exec";

    // --- Pemilihan Elemen DOM ---
    const cover = document.getElementById('cover');
    const openBtn = document.getElementById('openBtn');
    const content = document.getElementById('content');
    const bottomNav = document.querySelector('.bottom-nav');
    const guestNameElement = document.querySelector('#cover-guest .guest-name');
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    const rsvpForm = document.getElementById('rsvp-form');
    const guestbookList = document.getElementById('guestbook-list');
    const submitButton = rsvpForm.querySelector('button');

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

    // --- 4. RSVP: Ambil & Tampilkan Data dari Google Sheets ---
    const renderGuestbook = () => {
        fetch(SHEET_URL)
            .then(res => res.json())
            .then(entries => {
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
                // Panggil lagi animasi untuk entri baru
                setupScrollAnimations(); 
            })
            .catch(err => console.error("Gagal memuat buku tamu: ", err));
    };

    // Kirim data ke Google Sheet
    rsvpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simpan teks tombol asli dan nonaktifkan tombol
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Mengirim...';

        const newEntry = {
            nama: document.getElementById('form-nama').value,
            konfirmasi: document.getElementById('form-konfirmasi').value,
            pesan: document.getElementById('form-pesan').value
        };

        fetch(SHEET_URL, {
            method: "POST",
            body: JSON.stringify(newEntry),
            headers: { "Content-Type": "application/json" }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                rsvpForm.reset();
                renderGuestbook(); // Muat ulang daftar tamu
            } else {
                alert('Maaf, terjadi kesalahan saat mengirim ucapan.');
            }
        })
        .catch(err => console.error("Gagal kirim data: ", err))
        .finally(() => {
            // Kembalikan tombol ke keadaan semula
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        });
    });

    // --- 6. Navigasi, Musik, dan Fitur Salin ---
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

    // --- 7. Animasi Scroll ---
    const setupScrollAnimations = () => {
        const animatedElements = document.querySelectorAll('[class*="animate-"]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(element => {
            observer.observe(element);
        });
    };

    // --- Panggil Semua Fungsi Inisialisasi ---
    parseGuestName();
    startCountdown();
    renderGuestbook(); // Memuat data RSVP saat halaman pertama kali dibuka
    setupOtherFeatures();
    setupScrollAnimations();
});




