class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const number = this.getAttribute('number');
        const color = this.getAttribute('color');

        this.shadowRoot.innerHTML = `
            <style>
                .ball {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5em;
                    font-weight: bold;
                    color: white;
                    background-color: ${color};
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), inset 0 -4px 6px rgba(0, 0, 0, 0.3);
                    text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }
}

customElements.define('lotto-ball', LottoBall);


// Lotto Number Generation
document.getElementById('generate-btn').addEventListener('click', () => {
    const lottoBallsContainer = document.getElementById('lotto-numbers-container');
    if (!lottoBallsContainer) return;
    
    lottoBallsContainer.innerHTML = ''; 
    const numbers = new Set();

    while(numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    sortedNumbers.forEach(number => {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        lottoBall.setAttribute('color', getLottoColor(number));
        lottoBallsContainer.appendChild(lottoBall);
    });
});

function getLottoColor(number) {
    if (number <= 10) return '#fbc400'; // Yellow
    if (number <= 20) return '#69c8f2'; // Blue
    if (number <= 30) return '#ff7272'; // Red
    if (number <= 40) return '#aaa';    // Gray
    return '#b0d840';                   // Green
}

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const sunIcon = document.getElementById('sun-icon');
const moonIcon = document.getElementById('moon-icon');

const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcons(currentTheme);

themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcons(theme);
});

function updateThemeIcons(theme) {
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}
