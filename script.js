// iAGvR - Main JavaScript Logic & State Management

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE VARIABLES ---
  let userCredits = 100; // SOLUSI: Menaikkan kredit awal agar tidak terkunci di bawah 1
  let lastResetTime = 0;
  let historyList = [];
  let currentActiveTab = "text-to-image";
  let uploadedImageBase64 = null; // Stored image for Image to Video
  let activeAbortController = null; // Untuk membatalkan proses generation

  // --- HTML ELEMENT REFERENCES ---
  const creditCountEl = document.getElementById("credit-count");
  const loadingOverlay = document.getElementById("loading-overlay");
  const loadingTitle = document.getElementById("loading-title");
  const loadingStatus = document.getElementById("loading-status");
  const progressBar = document.getElementById("loading-progress-bar");
  const progressPercent = document.getElementById("loading-percent");
  const btnCancelGen = document.getElementById("btn-cancel-generation");

  // Dialog Overlay elements
  const dialogOverlay = document.getElementById("dialog-overlay");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogDesc = document.getElementById("dialog-description");
  const dialogButtonsContainer = document.getElementById("dialog-buttons-container");
  const dialogIconGraphic = document.getElementById("dialog-icon-graphic");

  // Toast Notification elements
  const toastNotification = document.getElementById("toast-notification");
  const toastMessage = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");
  const toastClose = document.getElementById("toast-close");

  // Image Upload Area elements
  const imageUploadArea = document.getElementById("image-upload-area");
  const imgInput = document.getElementById("img-input");
  const uploadPlaceholder = document.getElementById("upload-placeholder-content");
  const uploadPreviewContainer = document.getElementById("upload-preview-container");
  const uploadPreviewImg = document.getElementById("upload-preview-img");
  const btnRemovePreview = document.getElementById("btn-remove-preview");

  // Result Area elements
  const genResultsSection = document.getElementById("gen-results-section");
  const resultsTypeBadge = document.getElementById("results-type-badge");
  const imageResultsGallery = document.getElementById("image-results-gallery");
  const videoResultsContainer = document.getElementById("video-results-container");
  const resultsVideoPlayer = document.getElementById("results-video-player");
  const btnDownloadVideo = document.getElementById("btn-download-video");
  const btnAgainVideo = document.getElementById("btn-again-video");

  // Page active buttons / views
  const navButtons = document.querySelectorAll(".nav-btn");
  const appPages = document.querySelectorAll(".app-page");
  const subtabButtons = document.querySelectorAll(".subtab-btn");
  const subtabContents = document.querySelectorAll(".subtab-content");

  // --- INITIALIZE APP ---
  loadStateFromLocalStorage();
  checkAndResetDailyCredits();
  renderHistoryList();
  setupSettingsListeners();
  setupGenerationTriggers(); // Mendaftarkan tombol eksekusi

  // --- CREDIT SYSTEM LOGIC ---
  function loadStateFromLocalStorage() {
    const savedCredits = localStorage.getItem("iagvr_credits");
    if (savedCredits !== null) {
      userCredits = parseInt(savedCredits, 10);
    } else {
      userCredits = 100; // Diubah ke 100 agar aman untuk uji coba
      localStorage.setItem("iagvr_credits", userCredits);
    }
    updateCreditUI();

    const savedReset = localStorage.getItem("iagvr_last_reset");
    if (savedReset !== null) {
      lastResetTime = parseInt(savedReset, 10);
    } else {
      lastResetTime = Date.now();
      localStorage.setItem("iagvr_last_reset", lastResetTime);
    }

    const savedHistory = localStorage.getItem("iagvr_history");
    if (savedHistory !== null) {
      try { historyList = JSON.parse(savedHistory); } catch (e) { historyList = []; }
    } else {
      historyList = [];
    }

    const savedTheme = localStorage.getItem("iagvr_theme");
    const themeToggle = document.getElementById("theme-toggle");
    if (savedTheme === "light") {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      if (themeToggle) themeToggle.checked = false;
    } else {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      if (themeToggle) themeToggle.checked = true;
    }
  }

  function updateCreditUI() {
    if (creditCountEl) {
      creditCountEl.textContent = userCredits;
    }
  }

  function checkAndResetDailyCredits() {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (now - lastResetTime >= oneDayMs) {
      userCredits = 100;
      lastResetTime = now;
      localStorage.setItem("iagvr_credits", userCredits);
      localStorage.setItem("iagvr_last_reset", lastResetTime);
      updateCreditUI();
      showToast("Kredit harian Anda telah di-reset!", "info");
    }
  }

  function deductCredit() {
    if (userCredits > 0) {
      userCredits--;
      localStorage.setItem("iagvr_credits", userCredits);
      updateCreditUI();
      return true;
    }
    return false;
  }

  // --- CORE GENERATION ENGINE (FIXED AI STUDIO INTEGRATION) ---
  async function executeGeneration(type, prompt, params) {
    // 1. Check Credits
    if (userCredits < 1) {
      showDialog("Kredit Tidak Cukup", "Anda memerlukan setidaknya 1 kredit untuk melakukan generate gambar/video.");
      return;
    }

    // Tampilkan Loading Overlay ke Pengguna
    showLoading(true, "Menghubungkan ke Server AI...", "Memproses permintaan prompt Anda...");
    activeAbortController = new AbortController();

    // AMBIL CONFIG (Pastikan config.js Anda menyediakan data ini)
    // Jika tidak memakai config.js terpisah, Anda bisa langsung menulis String key Anda di sini.
    const API_KEY = window.AI_STUDIO_KEY || "AQ.Ab8RN6IbxoLKmWjzvMLzj9ijuDQJF7iEmSp3_lACc6zOAS9NFg";
    
    // SOLUSI ERROR 404: Menggunakan URL Endpoint resmi Google AI Studio yang valid dengan POST Method
    // Contoh di bawah menggunakan endpoint Gemini 1.5 Flash untuk text prompt. 
    // Sesuaikan nama model di URL jika Anda menggunakan model Gambar Imagen khusus (misal: imagen-3.0-generate-002)
    const API_URL = `https://googleapis.com{API_KEY}`;

    try {
      const response = await fetch(API_URL, {
        method: "POST", // WAJIB POST untuk Google AI Studio
        headers: {
          "Content-Type": "application/json"
        },
        signal: activeAbortController.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const data = await response.json();
      deductCredit(); // Potong kredit hanya jika server mengembalikan respon sukses

      // Proses sukses menampilkan data hasil AI asli
      showLoading(false);
      showToast("Kreasi Berhasil dibuat!", "success");
      
      // Kirim data hasil ke Galeri Hasil Anda
      renderResults(type, data);

    } catch (error) {
      showLoading(false);
      if (error.name === "AbortError") {
        showToast("Proses pembuatan dibatalkan.", "info");
      } else {
        // SOLUSI: Menampilkan error asli ke sistem dialog agar tidak diam-diam masuk ke mode offline
        showDialog("Gagal menghubungkan ke server AI", error.message);
      }
    }
  }

  // --- NAVIGATION & TABS ---
  window.switchMainPage = function(pageId) {
    appPages.forEach(page => page.classList.toggle("active", page.id === pageId));
    navButtons.forEach(btn => btn.classList.toggle("active", btn.getAttribute("data-page") === pageId));
  };

  navButtons.forEach(btn => {
    btn.addEventListener("click", () => switchMainPage(btn.getAttribute("data-page")));
  });

  subtabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      subtabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentActiveTab = btn.getAttribute("data-subtab");
      subtabContents.forEach(c => c.classList.toggle("active", c.id === `subtab-${currentActiveTab}`));
      if (genResultsSection) genResultsSection.style.display = "none";
    });
  });

  // --- UI HELPER FUNCTIONS ---
  function showLoading(visible, title = "", status = "") {
    if (!loadingOverlay) return;
    if (visible) {
      loadingOverlay.classList.add("active");
      if (loadingTitle) loadingTitle.textContent = title;
      if (loadingStatus) loadingStatus.textContent = status;
    } else {
      loadingOverlay.classList.remove("active");
    }
  }

  function showDialog(title, description) {
    if (!dialogOverlay || !dialogTitle || !dialogDesc) return;
    dialogTitle.textContent = title;
    dialogDesc.textContent = description;
    dialogOverlay.classList.add("active");
    
    // Sediakan tombol tutup di dalam dialog container secara otomatis
    if (dialogButtonsContainer) {
      dialogButtonsContainer.innerHTML = '<button class="btn-primary" id="btn-close-dialog">Mengerti</button>';
      document.getElementById("btn-close-dialog").addEventListener("click", () => {
        dialogOverlay.classList.remove("active");
      });
    }
  }

  function showToast(message, type = "info") {
    if (!toastNotification || !toastMessage) return;
    toastMessage.textContent = message;
    toastNotification.className = `toast-container active ${type}`;
    setTimeout(() => {
      toastNotification.classList.remove("active");
    }, 4000);
  }

  if (btnCancelGen) {
    btnCancelGen.addEventListener("click", () => {
      if (activeAbortController) activeAbortController.abort();
    });
  }

