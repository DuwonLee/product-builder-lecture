/**
 * Lucky App - Main JavaScript
 * Handles Lotto Generation, AI Animal Test, and Social Sharing
 */

// --- Constants & State ---
const LOTTO_MAX_NUMBER = 45;
const LOTTO_COUNT = 6;

// --- DOM Elements ---
const generateBtn = document.getElementById('generate-btn');
const lottoContainer = document.getElementById('lotto-numbers-container');
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

// Share Elements
const shareSection = document.getElementById('share-section');
const shareTwitterBtn = document.getElementById('share-twitter-btn');
const shareFacebookBtn = document.getElementById('share-facebook-btn');
const shareKakaoBtn = document.getElementById('share-kakao-btn');
const shareNativeBtn = document.getElementById('share-native-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');

// --- Theme Logic ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

function updateThemeIcons(theme) {
    if (!sunIcon || !moonIcon) return;
    if (theme === 'dark') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcons(newTheme);
    });
}

// --- Lotto Logic ---
function generateLottoNumbers() {
    const numbers = new Uint32Array(LOTTO_COUNT);
    const result = [];
    
    while (result.length < LOTTO_COUNT) {
        window.crypto.getRandomValues(numbers);
        const num = (numbers[0] % LOTTO_MAX_NUMBER) + 1;
        if (!result.includes(num)) {
            result.push(num);
        }
    }
    
    return result.sort((a, b) => a - b);
}

function displayLottoNumbers(numbers) {
    if (!lottoContainer) return;
    lottoContainer.innerHTML = '';
    
    numbers.forEach((num, index) => {
        const ball = document.createElement('div');
        ball.className = 'lotto-ball';
        ball.textContent = num;
        
        // Classic Lotto Ball Colors
        if (num <= 10) ball.style.backgroundColor = '#fbc400';      // Yellow
        else if (num <= 20) ball.style.backgroundColor = '#69c8f2'; // Blue
        else if (num <= 30) ball.style.backgroundColor = '#ff7272'; // Red
        else if (num <= 40) ball.style.backgroundColor = '#aaa';      // Gray
        else ball.style.backgroundColor = '#b0d840';                // Green
        
        lottoContainer.appendChild(ball);
    });

    if (shareSection) shareSection.style.display = 'block';
}

if (generateBtn) {
    generateBtn.addEventListener('click', () => {
        const numbers = generateLottoNumbers();
        displayLottoNumbers(numbers);
    });
}

// --- AI Animal Test Logic ---
let model, labelContainer, maxPredictions;

async function initAI() {
    const URL = "https://teachablemachine.withgoogle.com/models/I8-R01zQd/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        labelContainer = document.getElementById("label-container");
    } catch (e) {
        console.error("AI Model failed to load", e);
    }
}

async function predict(imageElement) {
    if (!model) await initAI();
    const prediction = await model.predict(imageElement);
    
    if (labelContainer) {
        labelContainer.innerHTML = '';
        prediction.sort((a, b) => b.probability - a.probability);
        
        const topResult = prediction[0];
        const resultTitle = document.createElement('div');
        resultTitle.className = 'result-title';
        resultTitle.innerHTML = `<h3>You look like a ${topResult.className}!</h3>`;
        labelContainer.appendChild(resultTitle);

        prediction.slice(0, 3).forEach(p => {
            const barContainer = document.createElement('div');
            barContainer.className = 'prediction-bar-container';
            
            const label = document.createElement('span');
            label.className = 'label-name';
            label.textContent = p.className;
            
            const barOuter = document.createElement('div');
            barOuter.className = 'progress-bar';
            
            const barInner = document.createElement('div');
            barInner.className = 'progress-fill';
            barInner.style.width = `${(p.probability * 100).toFixed(0)}%`;
            barInner.style.backgroundColor = getBarColor(p.probability);
            
            const percent = document.createElement('span');
            percent.className = 'label-prob';
            percent.textContent = `${(p.probability * 100).toFixed(0)}%`;
            
            barOuter.appendChild(barInner);
            barContainer.appendChild(label);
            barContainer.appendChild(barOuter);
            barContainer.appendChild(percent);
            labelContainer.appendChild(barContainer);
        });

        if (shareSection) shareSection.style.display = 'block';
    }
}

function getBarColor(prob) {
    if (prob > 0.7) return '#4CAF50';
    if (prob > 0.4) return '#FFC107';
    return '#FF5722';
}

// Image Upload
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const uploadArea = document.getElementById('upload-area');

if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                if (uploadArea) {
                    const label = uploadArea.querySelector('.upload-label');
                    if (label) label.style.display = 'none';
                }
                
                const spinner = document.getElementById('loading-spinner');
                if (spinner) spinner.style.display = 'block';
                
                const img = new Image();
                img.src = event.target.result;
                img.onload = async () => {
                    await predict(img);
                    if (spinner) spinner.style.display = 'none';
                };
            };
            reader.readAsDataURL(file);
        }
    });
}

// --- SNS Sharing Logic ---
function getShareContent() {
    const isLotto = !!document.getElementById('lotto-numbers-container');
    const url = window.location.href;
    let text = "Check out Lucky App!";
    
    if (isLotto) {
        const balls = document.querySelectorAll('.lotto-ball');
        if (balls.length > 0) {
            const numbers = Array.from(balls).map(b => b.textContent).join(', ');
            text = `🍀 My lucky numbers are: ${numbers}. Get yours at Lucky App!`;
        }
    } else {
        const titleEl = document.querySelector('.result-title h3');
        if (titleEl) {
            text = `🐾 ${titleEl.textContent} Find your AI animal double at Lucky App!`;
        }
    }
    return { text, url };
}

if (shareTwitterBtn) {
    shareTwitterBtn.addEventListener('click', () => {
        const { text, url } = getShareContent();
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    });
}

if (shareFacebookBtn) {
    shareFacebookBtn.addEventListener('click', () => {
        const { url } = getShareContent();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    });
}

if (shareKakaoBtn) {
    shareKakaoBtn.addEventListener('click', () => {
        const { text, url } = getShareContent();
        // Simple Kakao link sharing (web)
        window.open(`https://story.kakao.com/share?url=${encodeURIComponent(url)}`, '_blank');
        // Note: For deep linking to KakaoTalk app, official JS SDK is recommended.
    });
}

if (shareNativeBtn) {
    shareNativeBtn.addEventListener('click', async () => {
        const { text, url } = getShareContent();
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Lucky App', text, url });
            } catch (err) { console.log('Share failed', err); }
        } else {
            copyToClipboard(text + " " + url);
        }
    });
}

if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
        copyToClipboard(window.location.href);
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    if (window.location.pathname.includes('animal-test.html')) {
        initAI();
    }
});