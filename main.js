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
    
    // Use Web Crypto API for secure randomness
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
        ball.style.animationDelay = `${index * 0.1}s`;
        
        // Color coding based on number range
        if (num <= 10) ball.style.backgroundColor = '#fbc400';
        else if (num <= 20) ball.style.backgroundColor = '#69c8f2';
        else if (num <= 30) ball.style.backgroundColor = '#ff7272';
        else if (num <= 40) ball.style.backgroundColor = '#aaa';
        else ball.style.backgroundColor = '#b0d840';
        
        lottoContainer.appendChild(ball);
    });

    // Show share section
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
        // Sort by probability
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
            label.textContent = p.className;
            
            const barOuter = document.createElement('div');
            barOuter.className = 'bar-outer';
            
            const barInner = document.createElement('div');
            barInner.className = 'bar-inner';
            barInner.style.width = `${(p.probability * 100).toFixed(0)}%`;
            
            const percent = document.createElement('span');
            percent.textContent = `${(p.probability * 100).toFixed(0)}%`;
            
            barOuter.appendChild(barInner);
            barContainer.appendChild(label);
            barContainer.appendChild(barOuter);
            barContainer.appendChild(percent);
            labelContainer.appendChild(barContainer);
        });

        // Show share section
        if (shareSection) shareSection.style.display = 'block';
    }
}

// Image Upload Handling
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
                
                // Show loading and predict
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

// --- Sharing Logic ---
function getShareData() {
    const isLotto = !!document.getElementById('lotto-numbers-container');
    let title = "Lucky App - Boost Your Luck!";
    let text = "Check out this cool tool!";
    const url = window.location.href;

    if (isLotto) {
        const balls = document.querySelectorAll('.lotto-ball');
        if (balls.length > 0) {
            const numbers = Array.from(balls).map(b => b.textContent).join(', ');
            title = "My Lucky Numbers!";
            text = `I just generated my lucky lotto numbers: ${numbers}. Try your luck too!`;
        }
    } else if (document.querySelector('.result-title')) {
        const animal = document.querySelector('.result-title h3').textContent;
        title = "My AI Animal Face Result!";
        text = `I just took the AI Animal Face Test and... ${animal} Find your animal twin!`;
    }

    return { title, text, url };
}

if (shareNativeBtn) {
    shareNativeBtn.addEventListener('click', async () => {
        const shareData = getShareData();
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            copyToClipboard(shareData.text + " " + shareData.url);
        }
    });
}

if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', () => {
        const shareData = getShareData();
        copyToClipboard(shareData.url);
    });
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    if (window.location.pathname.includes('animal-test.html')) {
        initAI();
    }
});