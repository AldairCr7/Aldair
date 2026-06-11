const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const message = document.getElementById("message");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const modalIcon = document.getElementById("modalIcon");
const closeModal = document.getElementById("closeModal");

const toast = document.getElementById("toast");
const escapeBox = document.querySelector(".letter-window");
const noWrapper = document.querySelector(".no-wrapper");

const ntfyTopic = "Alerta-Aldair-Frappes-928471";
const ntfyUrl = `https://ntfy.sh/${ntfyTopic}`;

let notificationSent = false;
let accepted = false;
let lastNoActionTime = 0;
let noButtonIsReady = false;

const noActionCooldown = 260;
const safePadding = 28;

const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

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

function prepareNoButton() {
    if (noButtonIsReady) return;

    const buttonRect = noBtn.getBoundingClientRect();
    const boxRect = escapeBox.getBoundingClientRect();

    noWrapper.style.width = `${buttonRect.width}px`;
    noWrapper.style.height = `${buttonRect.height}px`;

    const startLeft = buttonRect.left - boxRect.left;
    const startTop = buttonRect.top - boxRect.top;

    escapeBox.appendChild(noBtn);

    noBtn.classList.add("escaped");
    noBtn.style.left = `${startLeft}px`;
    noBtn.style.top = `${startTop}px`;

    noButtonIsReady = true;

    requestAnimationFrame(() => {
        placeNoInsideCard();
    });
}

function syncNoPlaceholder() {
    if (!noButtonIsReady) return;

    noWrapper.style.width = `${noBtn.offsetWidth}px`;
    noWrapper.style.height = `${noBtn.offsetHeight}px`;
}

function getSafeNoPositionInsideCard() {
    const buttonWidth = noBtn.offsetWidth;
    const buttonHeight = noBtn.offsetHeight;

    const boxWidth = escapeBox.clientWidth;
    const boxHeight = escapeBox.clientHeight;

    const minX = safePadding;
    const minY = safePadding;

    const maxX = boxWidth - buttonWidth - safePadding;
    const maxY = boxHeight - buttonHeight - safePadding;

    const safeMaxX = Math.max(minX, maxX);
    const safeMaxY = Math.max(minY, maxY);

    const x = Math.random() * (safeMaxX - minX) + minX;
    const y = Math.random() * (safeMaxY - minY) + minY;

    return {
        x: clamp(x, minX, safeMaxX),
        y: clamp(y, minY, safeMaxY)
    };
}

function placeNoInsideCard() {
    if (!noButtonIsReady) return;

    const buttonWidth = noBtn.offsetWidth;
    const buttonHeight = noBtn.offsetHeight;

    const boxWidth = escapeBox.clientWidth;
    const boxHeight = escapeBox.clientHeight;

    const minX = safePadding;
    const minY = safePadding;

    const maxX = boxWidth - buttonWidth - safePadding;
    const maxY = boxHeight - buttonHeight - safePadding;

    const safeMaxX = Math.max(minX, maxX);
    const safeMaxY = Math.max(minY, maxY);

    const currentX = parseFloat(noBtn.style.left) || minX;
    const currentY = parseFloat(noBtn.style.top) || minY;

    noBtn.style.left = `${clamp(currentX, minX, safeMaxX)}px`;
    noBtn.style.top = `${clamp(currentY, minY, safeMaxY)}px`;
}

function moveNoButton() {
    prepareNoButton();

    const now = Date.now();

    if (now - lastNoActionTime < noActionCooldown) {
        return;
    }

    lastNoActionTime = now;

    const newPosition = getSafeNoPositionInsideCard();

    noBtn.style.left = `${newPosition.x}px`;
    noBtn.style.top = `${newPosition.y}px`;

    requestAnimationFrame(() => {
        placeNoInsideCard();
    });

    if (accepted) {
        message.textContent = "Ya aceptaste, pero el No sigue sin estar disponible.";
    } else {
        message.textContent = "La opción No no está disponible.";
    }
}

function moveNoButtonAfterTouch(event) {
    event.preventDefault();
    event.stopPropagation();

    /*
        En teléfono no lo movemos dentro del mismo toque.
        Lo mandamos al siguiente frame para que no se sienta trabado.
    */
    requestAnimationFrame(() => {
        moveNoButton();
    });
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
    for (let i = 0; i < 65; i++) {
        setTimeout(createConfettiPiece, i * 18);
    }

    for (let i = 0; i < 32; i++) {
        setTimeout(createHeartRain, i * 42);
    }
}

function acceptPlan() {
    if (accepted) return;

    accepted = true;

    yesBtn.disabled = true;

    /*
        El No NO se desactiva.
        Así puede seguir moviéndose después de aceptar.
    */
    noBtn.disabled = false;

    yesBtn.querySelector(".btn-text").textContent = "Aceptado";
    yesBtn.querySelector(".btn-emoji").textContent = "💗";

    message.textContent = "Listo. Aldair ya fue notificado.";

    celebrate();

    showModal(
        "Aceptación registrada",
        "Perfecto. Ya quedó confirmado el frappé.",
        "🥤"
    );

    if (!notificationSent) {
        sendNotification()
            .then(() => {
                notificationSent = true;
                showToast("Aldair ya recibió la notificación");
            })
            .catch((error) => {
                showToast("Aceptó, pero falló la notificación");
                console.error(error);
            });
    }
}

/*
    PC:
    Solo se mueve cuando el cursor pasa encima.

    Teléfono:
    Solo se mueve cuando intentan tocarlo.

    Click:
    Si lo atrapan, no hace nada.
*/

noBtn.addEventListener("mouseenter", function() {
    if (!supportsHover) return;
    moveNoButton();
});

noBtn.addEventListener("touchstart", moveNoButtonAfterTouch, {
    passive: false
});

noBtn.addEventListener("click", function(event) {
    event.preventDefault();
    event.stopPropagation();

    // Si lo atrapan, no hace nada.
});

yesBtn.addEventListener("click", function() {
    if (accepted) {
        showModal(
            "Ya estaba confirmado",
            "El frappé ya fue oficialmente aprobado.",
            "🥤"
        );
        return;
    }

    yesBtn.disabled = true;
    yesBtn.querySelector(".btn-text").textContent = "Enviando...";
    message.textContent = "Mandando notificación...";

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
    syncNoPlaceholder();
    placeNoInsideCard();
});

window.addEventListener("orientationchange", function() {
    setTimeout(() => {
        syncNoPlaceholder();
        placeNoInsideCard();
    }, 300);
});

/*
    Prepararlo desde el inicio evita que en teléfono se reacomode
    todo justo cuando presionan el botón No.
*/
requestAnimationFrame(() => {
    prepareNoButton();
});