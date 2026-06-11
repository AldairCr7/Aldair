const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const message = document.getElementById("message");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalIcon = document.getElementById("modalIcon");
const closeModal = document.getElementById("closeModal");

const toast = document.getElementById("toast");

const ntfyTopic = "Alerta-Aldair-Frappes-928471";
const ntfyUrl = `https://ntfy.sh/${ntfyTopic}`;

let notificationSent = false;
let accepted = false;
let lastNoActionTime = 0;

const screenPadding = 18;
const noActionCooldown = 180;

function showModal(title, text, icon = "🥤") {
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalIcon.textContent = icon;
    modal.classList.add("show");
}

function showToast(text) {
    toast.querySelector("p").textContent = text;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2600);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function getViewportBox() {
    const viewport = window.visualViewport;

    if (viewport) {
        return {
            width: viewport.width,
            height: viewport.height,
            left: viewport.offsetLeft,
            top: viewport.offsetTop
        };
    }

    return {
        width: window.innerWidth,
        height: window.innerHeight,
        left: 0,
        top: 0
    };
}

function getSafeNoPosition() {
    const viewport = getViewportBox();

    const buttonWidth = noBtn.offsetWidth;
    const buttonHeight = noBtn.offsetHeight;

    const minX = viewport.left + screenPadding;
    const minY = viewport.top + screenPadding;

    const maxX = viewport.left + viewport.width - buttonWidth - screenPadding;
    const maxY = viewport.top + viewport.height - buttonHeight - screenPadding;

    const safeMaxX = Math.max(minX, maxX);
    const safeMaxY = Math.max(minY, maxY);

    const x = Math.random() * (safeMaxX - minX) + minX;
    const y = Math.random() * (safeMaxY - minY) + minY;

    return {
        x: clamp(x, minX, safeMaxX),
        y: clamp(y, minY, safeMaxY)
    };
}

function placeNoInsideScreen() {
    if (!noBtn.classList.contains("escaped")) return;

    const viewport = getViewportBox();

    const buttonWidth = noBtn.offsetWidth;
    const buttonHeight = noBtn.offsetHeight;

    const minX = viewport.left + screenPadding;
    const minY = viewport.top + screenPadding;

    const maxX = viewport.left + viewport.width - buttonWidth - screenPadding;
    const maxY = viewport.top + viewport.height - buttonHeight - screenPadding;

    const safeMaxX = Math.max(minX, maxX);
    const safeMaxY = Math.max(minY, maxY);

    const currentPosition = noBtn.getBoundingClientRect();

    const fixedX = clamp(currentPosition.left, minX, safeMaxX);
    const fixedY = clamp(currentPosition.top, minY, safeMaxY);

    noBtn.style.left = `${fixedX}px`;
    noBtn.style.top = `${fixedY}px`;
}

function moveNoButton() {
    if (accepted) return;

    noBtn.classList.add("escaped");

    const newPosition = getSafeNoPosition();

    noBtn.style.left = `${newPosition.x}px`;
    noBtn.style.top = `${newPosition.y}px`;

    message.textContent = "La opción No no está disponible.";
}

function handleNoEscape(event) {
    if (accepted) return;

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const now = Date.now();

    if (now - lastNoActionTime < noActionCooldown) {
        return;
    }

    lastNoActionTime = now;

    moveNoButton();
}

async function sendNotification() {
    await fetch(ntfyUrl, {
        method: "POST",
        body: "Ximena aceptó ir por un frappé el jueves cuando salgan.",
        headers: {
            "Title": "Ximena aceptó",
            "Priority": "high",
            "Tags": "coffee,tada,heart"
        }
    });
}

function createConfettiPiece() {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");

    const colors = [
        "#ff4fa3",
        "#ffb703",
        "#8f4cff",
        "#ffffff",
        "#ff85c2",
        "#ffd1e8"
    ];

    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = `${Math.random() * 1.8 + 2.2}s`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    document.body.appendChild(confetti);

    setTimeout(() => {
        confetti.remove();
    }, 4500);
}

function createHeartRain() {
    const heart = document.createElement("div");
    heart.classList.add("heart-rain");

    const hearts = ["💗", "💖", "💘", "💕", "🥤", "✨"];

    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDuration = `${Math.random() * 1.6 + 2.4}s`;

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 4600);
}

function celebrate() {
    for (let i = 0; i < 85; i++) {
        setTimeout(createConfettiPiece, i * 18);
    }

    for (let i = 0; i < 42; i++) {
        setTimeout(createHeartRain, i * 42);
    }
}

async function acceptPlan() {
    if (accepted) return;

    accepted = true;

    yesBtn.disabled = true;
    noBtn.disabled = true;

    noBtn.classList.add("captured");
    noBtn.innerHTML = "<span>No disponible</span>";

    yesBtn.querySelector(".btn-text").textContent = "Aceptado";
    yesBtn.querySelector(".btn-emoji").textContent = "💗";

    message.textContent = "Listo. Aldair ya fue notificado.";

    try {
        if (!notificationSent) {
            await sendNotification();
            notificationSent = true;
            showToast("Aldair ya recibió la notificación");
        }
    } catch (error) {
        showToast("Aceptó, pero falló la notificación");
        console.error(error);
    }

    celebrate();

    showModal(
        "Aceptación registrada",
        "Perfecto. Ya quedó confirmado el frappé. Favor de presentarse con antojo y ganas de pasarla bonito.",
        "🥤"
    );
}

/*
    El botón No solo se mueve con:
    - mouseenter: cuando el cursor pasa por encima
    - touchstart: cuando lo intentan tocar en teléfono

    Si logran darle click, no hace nada.
*/

noBtn.addEventListener("mouseenter", handleNoEscape);

noBtn.addEventListener("touchstart", handleNoEscape, {
    passive: false
});

noBtn.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    // No hace absolutamente nada.
});

yesBtn.addEventListener("click", function() {
    if (accepted) {
        showModal(
            "Ya estaba confirmado",
            "No hace falta presionar dos veces. El frappé ya fue oficialmente aprobado.",
            "🥤"
        );
        return;
    }

    yesBtn.disabled = true;
    yesBtn.querySelector(".btn-text").textContent = "Enviando...";
    message.textContent = "Mandando notificación al patrón...";

    acceptPlan();
});

closeModal.addEventListener("click", function() {
    modal.classList.remove("show");
});

modal.addEventListener("click", function(event) {
    if (event.target === modal) {
        modal.classList.remove("show");
    }
});

window.addEventListener("resize", function() {
    placeNoInsideScreen();
});

if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", function() {
        placeNoInsideScreen();
    });
}