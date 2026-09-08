// --- GOOGLE DRIVE CONFIGURATION ---
const DRIVE_API_KEY = "AIzaSyCDJLgn8tdBuW_Wbcz5bq3-AvIvWbUf__s";
const DRIVE_AUDIO_FILE_ID = "162AjHeQVycd4JWIJ7BwsPwFL6-qyS779";
const DRIVE_FOLDER_ID = "1D4vjKXEnyAEru0HmuBAfbFAuMHrnft44";
const DRIVE_BACKGROUND_IMAGE_ID = "1CQWBR1UT8FdqjuOBiGb5_qYq815WEowu";
const DRIVE_FOLDER_ID_FOR_CLIENT = "1V-jHThQiQln-XA5UX4dnDd0Zgyka137r";
const MAX_GALLERY_IMAGES = 5;

// Global DOM references and status state
let audio = null;
let audioBtn = null;
let speakerIcon = null;
let audioLoaded = false;
let audioLoadPromise = null;

document.addEventListener("DOMContentLoaded", () => {
    // Bind DOM elements globally once page loads
    audio = document.getElementById('bgMusic');
    audioBtn = document.getElementById('audioControlBtn');
    speakerIcon = document.getElementById('speakerIcon');

    // Schedule scroll listener initialization
    const wrapper = document.getElementById('scheduleWrapper');
    const marker = document.getElementById('scrollMarker');
    const timeline = document.getElementById('timelineContainer');

    if (wrapper && marker && timeline) {
        wrapper.addEventListener('scroll', () => {
            const maxScroll = wrapper.scrollHeight - wrapper.clientHeight;
            if (maxScroll <= 0) return;

            const scrollPercent = wrapper.scrollTop / maxScroll;
            const startTop = 10;
            const endTop = timeline.clientHeight - 10;
            const newTop = startTop + (scrollPercent * (endTop - startTop));
            marker.style.top = `${newTop}px`;
        });
    }

    // Load audio stream safely and save promise reference
    audioLoadPromise = loadDriveAudio();
});

async function loadDriveAudio() {
    if (!audio || !DRIVE_AUDIO_FILE_ID) return;

    // Direct streaming edge endpoint (No auth/cookies required)
    const fallbackAudioUrl = `https://lh3.googleusercontent.com/d/${DRIVE_AUDIO_FILE_ID}`;

    try {
        const audioApiUrl = `https://www.googleapis.com/drive/v3/files/${DRIVE_AUDIO_FILE_ID}?alt=media&key=${DRIVE_API_KEY}`;
        const response = await fetch(audioApiUrl);

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const blob = await response.blob();
        audio.src = URL.createObjectURL(blob);
        audioLoaded = true;
    } catch (err) {
        console.warn("Drive API media fetch blocked (403/CORS). Switching to public edge stream fallback:", err);
        audio.src = fallbackAudioUrl;
        audioLoaded = true;
    }
}

async function openEnvelope() {
    document.getElementById('envelopeWrapper').classList.add('opened');
    document.getElementById('mainContent').classList.add('visible');

    const petalContainer = document.getElementById('petal-container');
    if (petalContainer) {
        petalContainer.style.display = 'block';
        startFlowerRain();
    }

    if (audioBtn) audioBtn.style.display = 'flex';

    // Await audio loading completion before playback
    if (audio) {
        try {
            if (audioLoadPromise) await audioLoadPromise;
            await audio.play();
        } catch (err) {
            console.warn("Autoplay interrupted or restricted:", err);
        }
    }

    initScratchCard();
    initScratchCardVenue();
    loadGoogleDriveImages();
}

function toggleAudio(event) {
    if (event) event.stopPropagation();

    if (!audio) audio = document.getElementById('bgMusic');
    if (!speakerIcon) speakerIcon = document.getElementById('speakerIcon');

    if (audio.paused) {
        audio.play().then(() => {
            speakerIcon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
        }).catch(err => console.error("Error playing audio:", err));
    } else {
        audio.pause();
        speakerIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    }
}

function scrollGallery(amount) {
    document.getElementById('galleryWrapper').scrollBy({ left: amount, behavior: 'smooth' });
}

async function loadGoogleDriveImages() {
    const wrapper = document.getElementById('galleryWrapper');
    const mainContent = document.getElementById('mainContent');

    if (DRIVE_API_KEY === "YOUR_GOOGLE_API_KEY_HERE" || DRIVE_FOLDER_ID === "YOUR_SHARED_FOLDER_ID_HERE") {
        wrapper.innerHTML = `
            <div class="img-card"><img src="https://picsum.photos/600/800?random=11"></div>
            <div class="img-card"><img src="https://picsum.photos/600/800?random=12"></div>
            <div class="img-card"><img src="https://picsum.photos/600/800?random=13"></div>
            <div class="img-card"><img src="https://picsum.photos/600/800?random=14"></div>
        `;
        mainContent.style.backgroundImage = "url('https://picsum.photos/1200/1600?random=100')";
        return;
    }

    const url = `https://www.googleapis.com/drive/v3/files?q='${DRIVE_FOLDER_ID}'+in+parents+and+mimeType+contains+'image/'&key=${DRIVE_API_KEY}&fields=files(id,name)`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.files && data.files.length > 0) {

            let defaultBckgId = DRIVE_BACKGROUND_IMAGE_ID;
            // Removed /u/0/ session reference
            const bgImgUrl = `https://lh3.googleusercontent.com/d/${defaultBckgId}`;
            mainContent.style.backgroundImage = `url('${bgImgUrl}')`;

            const url1 = `https://www.googleapis.com/drive/v3/files?q='${DRIVE_FOLDER_ID_FOR_CLIENT}'+in+parents+and+mimeType+contains+'image/'&key=${DRIVE_API_KEY}&fields=files(id,name)`;
            const response1 = await fetch(url1);
            const data1 = await response1.json();

            if (data1.files && data1.files.length > 0) {
                let shuffledFiles = data1.files.sort(() => 0.5 - Math.random());
                let selectedFiles = shuffledFiles.slice(0, MAX_GALLERY_IMAGES);
                wrapper.innerHTML = "";

                selectedFiles.forEach(file => {
                    if (file.id !== defaultBckgId) {
                        // Public direct thumbnail edge endpoint
                        const imgUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
                        const card = document.createElement('div');
                        card.className = 'img-card';
                        card.innerHTML = `<img src="${imgUrl}" alt="Wedding Memory Preview" onerror="this.parentElement.style.display='none'">`;
                        wrapper.appendChild(card);
                    }
                });
            }
        } else {
            throw new Error("No files found or private access error.");
        }
    } catch (error) {
        console.error("Error communicating with Drive endpoint API:", error);
        wrapper.innerHTML = `<p style="grid-column:1/-1; text-align:center; font-size:14px; width:100%;">Unable to stream images dynamically. Ensure folder permissions allow public discovery.</p>`;
    }
}

function startFlowerRain() {
    const container = document.getElementById('petal-container');
    if (!container) return;
    const petalCount = 35;
    for (let i = 0; i < petalCount; i++) {
        createPetal(container);
    }
}

function createPetal(container) {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = Math.random() * 14 + 8;
    const leftPos = Math.random() * 100;
    const delay = Math.random() * 10;
    const duration = Math.random() * 6 + 6;

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.2}px`;
    petal.style.left = `${leftPos}vw`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.animationDuration = `${duration}s`;

    const hueShift = Math.floor(Math.random() * 20);
    petal.style.backgroundColor = `hsl(${345 + hueShift}, 100%, 88%)`;

    container.appendChild(petal);

    petal.addEventListener('animationiteration', () => {
        petal.style.left = `${Math.random() * 100}vw`;
    });
}

function setupScratchCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let isDrawing = false;

    ctx.fillStyle = "#bc9c6c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "12px Montserrat";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText("SCRATCH WITH MOUSE OR FINGER", canvas.width / 2, canvas.height / 2 + 5);

    function scratch(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        if (clientX === undefined || clientY === undefined) return;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    canvas.addEventListener("mousedown", () => isDrawing = true);
    canvas.addEventListener("mouseup", () => isDrawing = false);
    canvas.addEventListener("mousemove", scratch);

    canvas.addEventListener("touchstart", () => isDrawing = true, { passive: true });
    canvas.addEventListener("touchend", () => isDrawing = false, { passive: true });
    canvas.addEventListener("touchmove", (e) => {
        scratch(e);
    }, { passive: true });
}

function initScratchCard() {
    setupScratchCanvas("scratch-canvas");
}

function initScratchCardVenue() {
    setupScratchCanvas("scratch-canvas-venue");
}

// --- COUNTDOWN LOGIC ---
const targetDate = new Date("Feb 11, 2027 16:30:00").getTime();
setInterval(function () {
    const now = new Date().getTime();
    const diff = targetDate - now;

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minsEl = document.getElementById("mins");
    const secsEl = document.getElementById("secs");

    if (daysEl && hoursEl && minsEl && secsEl) {
        daysEl.innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
        hoursEl.innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        minsEl.innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        secsEl.innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    }
}, 1000);