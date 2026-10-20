const MAX_FILE_SIZE = 5 * 1024 * 1024;
const HISTORY_KEY = "whisker.prediction-history.v1";
const THEME_KEY = "whisker.theme.v1";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const isLocalFrontend =
  window.location.protocol === "file:" || LOCAL_HOSTS.has(window.location.hostname);
const API_BASE_URL =
  isLocalFrontend && window.location.port !== "8000" ? "http://127.0.0.1:8000" : "";
const apiUrl = (path) => `${API_BASE_URL}${path}`;
const apiUnavailableMessage = () =>
  `Can't reach the classifier API at ${API_BASE_URL || window.location.origin}. Start it from the project folder with: python -m uvicorn backend.main:app --reload. Then reload this page.`;

const fileInput = document.querySelector("#file-input");
const dropzone = document.querySelector("#dropzone");
const resultCard = document.querySelector("#result-card");
const errorMessage = document.querySelector("#error-message");
const historyGrid = document.querySelector("#history-grid");
const emptyHistory = document.querySelector("#empty-history");
const toast = document.querySelector("#toast");
const apiStatus = document.querySelector(".api-status");
let history = loadHistory();
let previewUrl = null;
let toastTimeout;

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (Array.isArray(saved)) {
      return saved.filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.image === "string" &&
          (item.prediction === "cat" || item.prediction === "dog") &&
          Number.isFinite(item.confidence) &&
          Number.isFinite(item.createdAt),
      );
    }
    console.error("Saved prediction history has an invalid format.");
  } catch (error) {
    console.error("Could not read saved prediction history.", error);
  }
  return [];
}

function saveHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 8)));
    return true;
  } catch (error) {
    console.error("Could not save prediction history.", error);
    return false;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("visible"), 3200);
}

function setApiStatus(online) {
  apiStatus.classList.toggle("online", online);
  apiStatus.classList.toggle("offline", !online);
  apiStatus.querySelector(".status-text").textContent = online ? "AI is ready" : "AI is offline";
}

async function checkBackend() {
  try {
    const response = await fetch(apiUrl("/health"), { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`Health check failed (${response.status}).`);
    }
    setApiStatus(true);
  } catch (error) {
    setApiStatus(false);
    console.error("Could not reach the classifier backend.", error);
  }
}

function syncHistoryCount() {
  document.querySelector(".history-count").textContent = String(history.length);
}

function renderHistory() {
  historyGrid.replaceChildren();
  emptyHistory.hidden = history.length > 0;
  historyGrid.hidden = history.length === 0;
  document.querySelector("#clear-history").hidden = history.length === 0;

  for (const item of history) {
    const card = document.createElement("article");
    card.className = "history-item";

    const image = document.createElement("img");
    image.className = "history-image";
    image.src = item.image;
    image.alt = `${item.prediction} classified from ${item.name || "uploaded image"}`;

    const info = document.createElement("div");
    info.className = "history-info";
    const meta = document.createElement("div");
    meta.className = "history-meta";
    const tag = document.createElement("span");
    tag.className = `pet-tag ${item.prediction}`;
    tag.textContent = `${item.prediction === "cat" ? "✿" : "✦"} ${item.prediction}`;
    const remove = document.createElement("button");
    remove.className = "delete-button";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Remove ${item.name || item.prediction} from history`);
    remove.addEventListener("click", () => removeHistoryItem(item.id));

    const score = document.createElement("div");
    score.className = "history-score";
    score.textContent = `${Number(item.confidence).toFixed(2)}%`;
    const date = document.createElement("div");
    date.className = "history-date";
    date.textContent = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(item.createdAt));

    meta.append(tag, remove);
    info.append(meta, score, date);
    card.append(image, info);
    historyGrid.append(card);
  }
  syncHistoryCount();
}

function removeHistoryItem(id) {
  history = history.filter((item) => item.id !== id);
  if (saveHistory()) {
    renderHistory();
    showToast("Friend removed from your history.");
  } else {
    showToast("Could not update saved history. Check your browser storage settings.");
  }
}

function makeThumbnail(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const maxSide = 320;
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.68));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The image preview could not be prepared."));
    };
    image.src = objectUrl;
  });
}

function confidenceMessage(confidence, prediction) {
  if (confidence < 60) return "A tricky one! Our model is making its best guess.";
  if (confidence < 80) return "It's leaning this way, but there's a little mystery left.";
  return `This image is most likely a ${prediction}.`;
}

async function classifyImage(file) {
  errorMessage.hidden = true;
  const supportedImage = file && /\.(jpe?g|png|webp|bmp)$/i.test(file.name);
  if (!file || !supportedImage) {
    errorMessage.textContent = "Please choose an image file (JPG, PNG, WEBP or BMP).";
    errorMessage.hidden = false;
    return;
  }
  if (file.size > MAX_FILE_SIZE) {
    errorMessage.textContent = "That image is a little too big. Please choose a photo under 5 MB.";
    errorMessage.hidden = false;
    return;
  }

  resultCard.hidden = false;
  document.querySelector("#result-state").textContent = "TAKING A CLOSER LOOK…";
  document.querySelector("#result-label").textContent = "Thinking…";
  document.querySelector("#result-confidence").textContent = "—";
  document.querySelector("#confidence-bar").style.width = "0";
  document.querySelector("#result-footnote").textContent = "Your image is being checked by the model.";

  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  document.querySelector("#result-image").src = previewUrl;
  resultCard.scrollIntoView({ behavior: "smooth", block: "center" });

  const form = new FormData();
  form.append("file", file, file.name || "sample.jpg");

  try {
    const response = await fetch(apiUrl("/predict"), { method: "POST", body: form });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`The classifier returned an error (${response.status}). ${detail.slice(0, 180)}`);
    }
    const result = await response.json();
    if (!["cat", "dog"].includes(result.prediction) || !Number.isFinite(result.confidence)) {
      throw new Error("The classifier response did not include a valid prediction.");
    }

    const confidence = Math.max(0, Math.min(100, result.confidence));
    document.querySelector("#result-state").textContent = "PREDICTION COMPLETE";
    document.querySelector("#result-label").textContent = `${result.prediction === "cat" ? "Cat" : "Dog"}!`;
    document.querySelector("#result-confidence").textContent = `${confidence.toFixed(2)}%`;
    document.querySelector("#confidence-bar").style.width = `${confidence}%`;
    document.querySelector("#result-footnote").textContent = confidenceMessage(confidence, result.prediction);
    setApiStatus(true);

    try {
      const item = {
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
        name: file.name || "Sample image",
        prediction: result.prediction,
        confidence,
        image: await makeThumbnail(file),
        createdAt: Date.now(),
      };
      history = [item, ...history.filter((entry) => entry.id !== item.id)].slice(0, 8);
      if (saveHistory()) {
        renderHistory();
      } else {
        showToast("Prediction complete, but this browser couldn't save it to history.");
      }
    } catch (error) {
      console.error("Prediction succeeded, but its history thumbnail could not be prepared.", error);
      showToast("Prediction complete, but its photo could not be added to history.");
    }
  } catch (error) {
    console.error("Image classification failed.", error);
    setApiStatus(false);
    document.querySelector("#result-state").textContent = "WE HIT A LITTLE SNAG";
    document.querySelector("#result-label").textContent = "Not quite yet";
    document.querySelector("#result-footnote").textContent = "Check that the backend is running, then give it another try.";
    errorMessage.textContent =
      error instanceof TypeError
        ? apiUnavailableMessage()
        : error.message || "The image could not be classified.";
    errorMessage.hidden = false;
  }
}

fileInput.addEventListener("change", () => {
  const [file] = fileInput.files;
  if (file) classifyImage(file);
  fileInput.value = "";
});

for (const eventName of ["dragenter", "dragover"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragover");
  });
}
for (const eventName of ["dragleave", "drop"]) {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragover");
  });
}
dropzone.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  if (file) classifyImage(file);
});
dropzone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    fileInput.click();
  }
});

document.querySelectorAll("[data-sample]").forEach((button) => {
  button.addEventListener("click", async () => {
    const kind = button.dataset.sample;
    button.disabled = true;
    button.textContent = "Loading…";
    try {
      const response = await fetch(apiUrl(`/samples/${kind}`));
      if (!response.ok) throw new Error(`Couldn't load the ${kind} sample (${response.status}).`);
      const blob = await response.blob();
      await classifyImage(new File([blob], `whisker-${kind}-sample.jpg`, { type: blob.type || "image/jpeg" }));
    } catch (error) {
      console.error("Sample image could not be loaded.", error);
      errorMessage.textContent =
        error instanceof TypeError ? apiUnavailableMessage() : error.message;
      errorMessage.hidden = false;
    } finally {
      button.disabled = false;
      button.textContent = `Try a ${kind}`;
    }
  });
});

document.querySelector("#another-button").addEventListener("click", () => {
  document.querySelector("#predict").scrollIntoView({ behavior: "smooth" });
  fileInput.click();
});

document.querySelector("#clear-history").addEventListener("click", () => {
  history = [];
  if (saveHistory()) {
    renderHistory();
    showToast("Your prediction history has been cleared.");
  } else {
    showToast("Could not clear saved history. Check your browser storage settings.");
  }
});

const themeToggle = document.querySelector(".theme-toggle");
function setTheme(theme) {
  const light = theme === "light";
  document.body.classList.toggle("light-theme", light);
  themeToggle.textContent = light ? "☾" : "☼";
  themeToggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
  try {
    localStorage.setItem(THEME_KEY, light ? "light" : "dark");
  } catch (error) {
    console.error("Could not save the color theme preference.", error);
  }
}

themeToggle.addEventListener("click", () => {
  setTheme(document.body.classList.contains("light-theme") ? "dark" : "light");
});
try {
  setTheme(localStorage.getItem(THEME_KEY) || "dark");
} catch (error) {
  console.error("Could not read the color theme preference.", error);
  setTheme("dark");
}

const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
if ("IntersectionObserver" in globalThis) {
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle("active", link.hash === `#${visible.target.id}`));
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5] },
  );
  sections.forEach((section) => observer.observe(section));
}

renderHistory();
checkBackend();
