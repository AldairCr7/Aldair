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

let noAttempts = 0;
let notificationSent = false;
let noButtonInterval = null;

const noMessages = [
    "Uy, casi. Pero el destino dijo que no.",
    "La opción No se fue a terapia.",
    "Error 404: rechazo no encontrado.",
    "El universo bloqueó esa opción.",
    "Ese botón no tiene permisos para existir.",
    "Mejor el Sí, tiene mejores prestaciones.",
    "No disponible por mantenimiento emocional.",
    "El frappé exige una respuesta positiva.",
    "No se puede cancelar lo que ya estaba escrito.",
    "Ese No acaba de renunciar.",
    "El No está fuera de cobertura.",
    "La NASA confirmó que ese botón no existe.",
    "Ese botón tiene miedo al compromiso.",
    "No autorizado por el comité del frappé.",
    "Demasiado tarde, el Sí ya ganó."
];

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

function moveNoButton() {
    noAttempts++;

    noBtn.classList.add("escaped");

    const buttonWidth = noBtn.offsetWidth;
    const buttonHeight = noBtn.offsetHeight;

    const padding = 18;

    const maxX = window.innerWidth - buttonWidth - padding;
    const maxY = window.innerHeight - buttonHeight - padding;

    const randomX = Math.floor(Math.random() * Math.max(maxX, 1)) + 5;
    const randomY = Math.floor(Math.random() * Math.max(maxY, 1)) + 5;

    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;

    message.textContent = noMessages[noAttempts % noMessages.length];

    if (noAttempts % 8 === 0) {
        showToast("El botón No sigue huyendo");
    }
}

function startNoButtonEscape() {
    if (noButtonInterval !== null) return;

    moveNoButton();

    noButtonInterval = setInterval(() => {
        moveNoButton();
    }, 850);
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

noBtn.addEventListener("mouseenter", startNoButtonEscape);

noBtn.addEventListener("touchstart", function(event) {
    event.preventDefault();
    startNoButtonEscape();
});

noBtn.addEventListener("focus", startNoButtonEscape);

noBtn.addEventListener("click", function() {
    showModal(
        "Gracias por aceptar",
        "Lo sentimos, la opción “No” fue eliminada por falta de pruebas. Entonces queda confirmado el frappé.",
        "😌"
    );

    message.textContent = "Técnicamente eso cuenta como un Sí.";
});

yesBtn.addEventListener("click", async function() {
    if (notificationSent) {
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

    try {
        await sendNotification();

        notificationSent = true;

        yesBtn.querySelector(".btn-text").textContent = "Aceptado";
        yesBtn.querySelector(".btn-emoji").textContent = "💗";

        message.textContent = "Listo. Aldair ya fue notificado.";

        showToast("Aldair ya recibió la notificación");
        celebrate();

        showModal(
            "Aceptación registrada",
            "Perfecto. Ya quedó confirmado el frappé. Favor de presentarse con antojo y ganas de pasarla bonito.",
            "🥤"
        );

    } catch (error) {
        yesBtn.disabled = false;
        yesBtn.querySelector(".btn-text").textContent = "Sí, jalo";
        yesBtn.querySelector(".btn-emoji").textContent = "✨";

        message.textContent = "No se pudo mandar la notificación.";

        showModal(
            "Algo falló",
            "La respuesta fue Sí, pero no se pudo mandar la notificación. Revisa internet o el topic de ntfy.",
            "⚠️"
        );

        console.error(error);
    }
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
    if (noBtn.classList.contains("escaped")) {
        moveNoButton();
    }
});

setTimeout(() => {
    startNoButtonEscape();
}, 1200);