const PHRASES = [
    { es: 'Hola, bienvenido.', en: 'Hello, welcome.' },
    { es: '¿Qué desea ordenar?', en: 'What would you like to order?' },
    { es: '¿Algo más?', en: 'Anything else?' },
    { es: '¿Para aquí o para llevar?', en: 'For here or to go?' },
    { es: '¿Con leche?', en: 'With milk?' },
    { es: '¿Con azúcar?', en: 'With sugar?' },
    { es: '¿Tamaño grande o pequeño?', en: 'Large or small size?' },
    { es: 'El total es...', en: 'The total is...' },
    { es: 'Muchas gracias, que tenga un buen día.', en: 'Thank you so much, have a nice day.' }
];

const QUIZ = [
    { q: '¿Cómo se dice "Para aquí o para llevar?"', options: ['For now or for later?', 'Here or to go?', 'For here or to go?'], a: 2 },
    { q: 'Un cliente te dice "Good morning". ¿Qué le respondes?', options: ['Good afternoon', 'Good morning', 'How are you?'], a: 1 },
    { q: 'Si un cliente pide "a large coffee", ¿qué significa?', options: ['Un café pequeño', 'Un café sin azúcar', 'Un café grande'], a: 2 },
    { q: 'Para preguntar si quiere algo más, dices:', options: ['Is there anything else?', 'Anything else?', 'That\'s all?'], a: 1 }
];

// --- Speech & Audio Functions ---
const synth = window.speechSynthesis;
function speak(text) {
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    synth.speak(utterance);
}

// --- Render Phrases ---
const phraseListEl = document.getElementById('phraseList');
function renderPhrases() {
    phraseListEl.innerHTML = '';
    PHRASES.forEach(p => {
        const card = document.createElement('div');
        card.className = 'phrase-card';
        card.innerHTML = `
            <div>${p.es}</div>
            <div style="font-weight:bold; margin-top:8px;">${p.en}</div>
            <button class="play" onclick="speak('${p.en}')">🔊 Escuchar</button>
        `;
        phraseListEl.appendChild(card);
    });
}
renderPhrases();

// --- Quiz Logic ---
const quizEl = document.getElementById('quiz');
let quizIndex = 0;
let score = 0;
function renderQuiz() {
    quizEl.innerHTML = '';
    const item = QUIZ[quizIndex];
    const qh = document.createElement('div');
    qh.className = 'quiz-question';
    qh.textContent = item.q;
    quizEl.appendChild(qh);
    
    const opts = document.createElement('div');
    opts.className = 'options';
    item.options.forEach((o, idx) => {
        const op = document.createElement('div');
        op.className = 'option';
        op.textContent = o;
        op.onclick = () => {
            if (op.dataset.answered) return;
            op.dataset.answered = '1';
            if (idx === item.a) {
                op.classList.add('correct');
                score++;
            } else {
                op.classList.add('wrong');
                opts.children[item.a].classList.add('correct');
            }
            setTimeout(() => {
                quizIndex++;
                if (quizIndex >= QUIZ.length) {
                    showQuizEnd();
                } else {
                    renderQuiz();
                }
            }, 900);
        };
        opts.appendChild(op);
    });
    quizEl.appendChild(opts);
}
function showQuizEnd() {
    quizEl.innerHTML = `<div style="font-weight:800">Prueba terminada ✔️</div><div class="small">Puntaje: ${score} / ${QUIZ.length}</div>`;
}
document.getElementById('startQuiz').onclick = () => {
    quizIndex = 0;
    score = 0;
    renderQuiz();
};
document.getElementById('scoreBtn').onclick = () => {
    alert('Puntaje actual: ' + score + ' / ' + QUIZ.length);
};

// --- Simple Spanish->English Converter ---
const convBtn = document.getElementById('convBtn');
const inputEs = document.getElementById('inputEs');
const convResult = document.getElementById('convResult');
convBtn.onclick = () => {
    const text = inputEs.value.trim();
    if (!text) return;
    let s = text.toLowerCase();
    s = s.replace(/¿|\?|¡|!/g, '').trim();
    s = s.replace(/^me da /g, 'Can I have ');
    s = s.replace(/^me das /g, 'Can I have ');
    s = s.replace(/un café con leche/g, 'a coffee with milk');
    s = s.replace(/para aqui/g, 'for here');
    s = s.replace(/para llevar/g, 'to go');
    s = s.replace(/con azúcar/g, 'with sugar');
    s = s.replace(/sin azúcar/g, 'without sugar');

    if (s === text.toLowerCase()) {
        convResult.innerHTML = `<div class="small">No estoy segura. Prueba escribir: "¿Me da un café con leche?"</div>`;
    } else {
        const resultText = capitalize(s);
        convResult.innerHTML = `
            <div style="padding:10px;border-radius:8px;background:#f0f7f6">
                <strong>Inglés sugerido:</strong>
                <div style="margin-top:6px;font-weight:700">${resultText}</div>
                <div style="margin-top:6px">
                    <button class="play" onclick="speak('${escapeJs(resultText)}')">🔊 Escuchar</button>
                    <button class="copy" onclick="navigator.clipboard.writeText('${escapeJs(resultText)}')">Copiar</button>
                </div>
            </div>`;
    }
};

// --- Speech Recognition ---
let recog = null;
try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        recog = new SpeechRecognition();
        recog.lang = 'en-US';
        recog.interimResults = false;
        recog.maxAlternatives = 1;
        recog.onresult = (e) => {
            document.getElementById('recognized').textContent = e.results[0][0].transcript;
        };
        recog.onerror = (e) => {
            document.getElementById('recognized').textContent = 'Error: ' + e.error;
        };
    }
} catch (e) {
    recog = null;
}
document.getElementById('startRec').onclick = () => {
    if (recog) {
        recog.start();
        document.getElementById('recognized').textContent = 'Escuchando...';
    } else {
        alert('Reconocimiento no disponible en este navegador.');
    }
};
document.getElementById('stopRec').onclick = () => {
    if (recog) {
        recog.stop();
        document.getElementById('recognized').textContent = 'Detenido';
    }
};

// --- Helper Functions ---
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function escapeJs(s) {
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// Welcome message on page load
window.onload = () => {
    setTimeout(() => {
        speak('Welcome to Coffee English.');
    }, 800);
};