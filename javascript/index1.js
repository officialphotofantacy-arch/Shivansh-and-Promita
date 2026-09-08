// --- GOOGLE DRIVE & YOUTUBE CONFIGURATION ---
const DRIVE_API_KEY = "AIzaSyCDJLgn8tdBuW_Wbcz5bq3-AvIvWbUf__s";
const DRIVE_BACKGROUND_IMAGE_ID = "19fWRZdgZkohOZ8OWIFVmOVMVa9Q2nxzu";
const DRIVE_FOLDER_ID_FOR_CLIENT = "1V-jHThQiQln-XA5UX4dnDd0Zgyka137r";
const YOUTUBE_VIDEO_ID = "nvpbdKaaNwQ";
const MAX_GALLERY_IMAGES = 5;

// Static backup images in case Drive API limits or network errors occur
const FALLBACK_IMAGES = [
    "https://picsum.photos/600/800?random=11",
    "https://picsum.photos/600/800?random=12",
    "https://picsum.photos/600/800?random=13",
    "https://picsum.photos/600/800?random=14"
];

// Global DOM references and status state
let audioBtn = null;
let speakerIcon = null;
let player = null;
let isPlayerReady = false;
let playPending = false;

// 1. Dynamic Load YouTube IFrame API Script
(function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

// 2. Automatically triggered when YouTube API is ready
function onYouTubeIframeAPIReady() {
    const currentOrigin = (window.location.origin && window.location.origin !== "null")
        ? window.location.origin
        : "https://officialphotofantacy-arch.github.io";

    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: YOUTUBE_VIDEO_ID,
        host: 'https://www.youtube.com',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': YOUTUBE_VIDEO_ID,
            'enablejsapi': 1,
            'origin': currentOrigin,
            'playsinline': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    console.log("YouTube background audio player ready.");

    if (playPending && player) {
        startYouTubeAudio();
    }
}

function startYouTubeAudio() {
    if (!player) return;
    try {
        player.unMute();
        player.setVolume(100);
        player.playVideo();
    } catch (err) {
        console.warn("YouTube Audio Playback Error:", err);
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        updateSpeakerIcon(true);
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        updateSpeakerIcon(false);
    }
}

document.addEventListener("DOMContentLoaded", () => {
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
        }, { passive: true });
    }

    // Gallery swipe hint auto-hide on interaction
    const galleryWrapper = document.getElementById('galleryWrapper');
    const swipeHint = document.getElementById('swipeHint');
    if (galleryWrapper && swipeHint) {
        galleryWrapper.addEventListener('scroll', () => {
            if (galleryWrapper.scrollLeft > 20) {
                swipeHint.style.opacity = '0';
                setTimeout(() => {
                    swipeHint.style.display = 'none';
                }, 500);
            }
        }, { passive: true });
    }
});

// 3. Open Envelope Handler
async function openEnvelope() {
    document.getElementById('envelopeWrapper').classList.add('opened');
    document.getElementById('mainContent').classList.add('visible');

    const petalContainer = document.getElementById('petal-container');
    if (petalContainer) {
        petalContainer.style.display = 'block';
        startFlowerRain();
    }

    if (audioBtn) audioBtn.style.display = 'flex';

    if (isPlayerReady && player) {
        startYouTubeAudio();
    } else {
        playPending = true;
    }

    setTimeout(() => {
        initScratchCard();
        initScratchCardVenue();
    }, 100);

    loadGoogleDriveImages();
}

// 4. Toggle YouTube Audio Play / Pause
function toggleAudio(event) {
    if (event) event.stopPropagation();
    if (!player || typeof player.getPlayerState !== 'function') return;

    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        startYouTubeAudio();
    }
}

function updateSpeakerIcon(playing) {
    if (!speakerIcon) speakerIcon = document.getElementById('speakerIcon');
    if (!speakerIcon) return;

    if (playing) {
        speakerIcon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
    } else {
        speakerIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    }
}

function scrollGallery(amount) {
    const gallery = document.getElementById('galleryWrapper');
    if (gallery) {
        gallery.scrollBy({ left: amount, behavior: 'smooth' });
    }
}

// 5. Load Google Drive Gallery Images
async function loadGoogleDriveImages() {
    const wrapper = document.getElementById('galleryWrapper');
    const mainContent = document.getElementById('mainContent');

    if (DRIVE_BACKGROUND_IMAGE_ID && mainContent) {
        mainContent.style.backgroundImage = `url('https://lh3.googleusercontent.com/d/${DRIVE_BACKGROUND_IMAGE_ID}')`;
    }

    const query = encodeURIComponent(`'${DRIVE_FOLDER_ID_FOR_CLIENT}' in parents and mimeType contains 'image/'`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${DRIVE_API_KEY}&fields=files(id,name)`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const data = await response.json();

        if (data.files && data.files.length > 0) {
            // Filter background image out prior to sorting
            const galleryFiles = data.files.filter(file => file.id !== DRIVE_BACKGROUND_IMAGE_ID);

            // Alphanumeric natural sort (e.g. photo_1, photo_2, photo_10)
            galleryFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

            const selectedFiles = galleryFiles.slice(0, MAX_GALLERY_IMAGES);
            wrapper.innerHTML = "";

            selectedFiles.forEach(file => {
                const imgUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
                const card = document.createElement('div');
                card.className = 'img-card';
                card.innerHTML = `<img src="${imgUrl}" alt="${file.name}" onerror="this.src='${FALLBACK_IMAGES[0]}'">`;
                wrapper.appendChild(card);
            });
        } else {
            throw new Error("No files found in folder.");
        }
    } catch (error) {
        console.warn("Drive API image fetch failed, rendering fallbacks:", error);
        renderFallbackGallery(wrapper);
    }
}

function renderFallbackGallery(wrapper) {
    if (!wrapper) return;
    wrapper.innerHTML = FALLBACK_IMAGES.map(src =>
        `<div class="img-card"><img src="${src}" alt="Fallback Preview"></div>`
    ).join('');
}

// 6. Petals / Flower Rain Animation
function startFlowerRain() {
    const container = document.getElementById('petal-container');
    if (!container) return;
    const petalCount = 35;
    for (let i = 0; i < petalCount; i++) {
        createRosePetal(container);
    }
}

function createRosePetal(container) {
    const petal = document.createElement('div');
    petal.className = 'rose-petal';

    const size = Math.random() * 12 + 10;
    const leftPos = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = Math.random() * 5 + 6;

    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.3}px`;
    petal.style.left = `${leftPos}vw`;
    petal.style.animationDelay = `${delay}s`;
    petal.style.animationDuration = `${duration}s`;

    // Rose/Crimson palette randomized
    const hue = Math.floor(Math.random() * 12) + 340;
    const lightness = Math.floor(Math.random() * 20) + 35;
    petal.style.background = `linear-gradient(135deg, hsl(${hue}, 85%, ${lightness + 15}%), hsl(${hue}, 80%, ${lightness}%))`;

    container.appendChild(petal);

    petal.addEventListener('animationiteration', () => {
        petal.style.left = `${Math.random() * 100}vw`;
    });
}

// 7. Scratch Card Setup
function setupScratchCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let isDrawing = false;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 320;
    const height = rect.height || 150;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Rose Gold / Metallic overlay
    ctx.fillStyle = "#d4a3a8";
    ctx.fillRect(0, 0, width, height);
    ctx.font = "600 12px Montserrat, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH WITH MOUSE OR FINGER", width / 2, height / 2);

    function getTouchPos(e) {
        const currentRect = canvas.getBoundingClientRect();
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        return {
            x: clientX - currentRect.left,
            y: clientY - currentRect.top
        };
    }

    function scratch(e) {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault();

        const pos = getTouchPos(e);
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
        ctx.fill();
    }

    const startScratch = (e) => { isDrawing = true; scratch(e); };
    const stopScratch = () => { isDrawing = false; };

    canvas.addEventListener("mousedown", startScratch);
    canvas.addEventListener("mousemove", scratch);
    canvas.addEventListener("mouseup", stopScratch);
    canvas.addEventListener("mouseleave", stopScratch);

    canvas.addEventListener("touchstart", startScratch, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    canvas.addEventListener("touchend", stopScratch);
}

function initScratchCard() {
    setupScratchCanvas("scratch-canvas");
}

function initScratchCardVenue() {
    setupScratchCanvas("scratch-canvas-venue");
}

// 8. Countdown Timer
const targetDate = new Date("Feb 11, 2027 19:00:00").getTime();
setInterval(function () {
    const now = new Date().getTime();
    const diff = targetDate - now;

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minsEl = document.getElementById("mins");
    const secsEl = document.getElementById("secs");

    if (daysEl && hoursEl && minsEl && secsEl) {
        if (diff <= 0) {
            daysEl.innerText = "00";
            hoursEl.innerText = "00";
            minsEl.innerText = "00";
            secsEl.innerText = "00";
            return;
        }
        daysEl.innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
        hoursEl.innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
        minsEl.innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        secsEl.innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    }
}, 1000);