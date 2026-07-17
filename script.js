// iAGvR - Main JavaScript Logic & State Management

document.addEventListener("DOMContentLoaded", () => {
  // --- STATE VARIABLES ---
  let userCredits = 4;
  let lastResetTime = 0;
  let historyList = [];
  let currentActiveTab = "text-to-image";
  let uploadedImageBase64 = null; // Stored image for Image to Video

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

  // --- CREDIT SYSTEM LOGIC ---
  function loadStateFromLocalStorage() {
    // Load Credits
    const savedCredits = localStorage.getItem("iagvr_credits");
    if (savedCredits !== null) {
      userCredits = parseInt(savedCredits, 10);
    } else {
      userCredits = 4;
      localStorage.setItem("iagvr_credits", userCredits);
    }
    updateCreditUI();

    // Load Last Reset Time
    const savedReset = localStorage.getItem("iagvr_last_reset");
    if (savedReset !== null) {
      lastResetTime = parseInt(savedReset, 10);
    } else {
      lastResetTime = Date.now();
      localStorage.setItem("iagvr_last_reset", lastResetTime);
    }

    // Load History list
    const savedHistory = localStorage.getItem("iagvr_history");
    if (savedHistory !== null) {
      try {
        historyList = JSON.parse(savedHistory);
      } catch (e) {
        historyList = [];
      }
    } else {
      historyList = [];
    }

    // Load App Theme Setting
    const savedTheme = localStorage.getItem("iagvr_theme");
    const themeToggle = document.getElementById("theme-toggle");
    if (savedTheme === "light") {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      if (themeToggle) themeToggle.checked = false;
      updateThemeLabel(false);
    } else {
      document.body.classList.add("dark-theme");
      document.body.classList.remove("light-theme");
      if (themeToggle) themeToggle.checked = true;
      updateThemeLabel(true);
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
    
    // Check if 24 hours have passed since the last reset time
    if (now - lastResetTime >= oneDayMs) {
      userCredits = 4;
      lastResetTime = now;
      localStorage.setItem("iagvr_credits", userCredits);
      localStorage.setItem("iagvr_last_reset", lastResetTime);
      updateCreditUI();
      showToast("Kredit harian Anda telah di-reset menjadi 4!", "info");
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

  // --- ROUTING / TAB TRANSITIONS ---
  window.switchMainPage = function(pageId) {
    appPages.forEach(page => {
      if (page.id === pageId) {
        page.classList.add("active");
      } else {
        page.classList.remove("active");
      }
    });

    navButtons.forEach(btn => {
      if (btn.getAttribute("data-page") === pageId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  };

  // Nav buttons click events
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPage = btn.getAttribute("data-page");
      switchMainPage(targetPage);
    });
  });

  // Subtabs click events (Text to image, text to video, img to video)
  subtabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      subtabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const targetSubtab = btn.getAttribute("data-subtab");
      currentActiveTab = targetSubtab;

      subtabContents.forEach(content => {
        if (content.id === `subtab-${targetSubtab}`) {
          content.classList.add("active");
        } else {
          content.classList.remove("active");
        }
      });
      
      // Hide results when changing tabs to prevent confusion
      genResultsSection.style.display = "none";
    });
  });

  // --- COMPONENT INTERACTIVES ---
  // Aspect Ratio selector Text to Image
  const ratioBtns = document.querySelectorAll(".ratio-btn");
  ratioBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      ratioBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Image Count selector
  const countBtns = document.querySelectorAll(".segment-btn");
  countBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      countBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Video Duration Selector (Text to Video)
  const durationBtns = document.querySelectorAll(".duration-btn");
  durationBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      durationBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Video Ratio Selector (Text to Video)
  const ratioVideoBtns = document.querySelectorAll(".ratio-video-btn");
  ratioVideoBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      ratioVideoBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Image to Video Duration Selector
  const imgDurationBtns = document.querySelectorAll(".img-duration-btn");
  imgDurationBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      imgDurationBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // --- IMAGE UPLOAD LOGIC ---
  if (imageUploadArea) {
    imageUploadArea.addEventListener("click", (e) => {
      // Don't trigger if remove button is clicked
      if (e.target.closest("#btn-remove-preview")) return;
      imgInput.click();
    });

    // Drag over support
    imageUploadArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      imageUploadArea.classList.add("dragover");
    });

    imageUploadArea.addEventListener("dragleave", () => {
      imageUploadArea.classList.remove("dragover");
    });

    imageUploadArea.addEventListener("drop", (e) => {
      e.preventDefault();
      imageUploadArea.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (imgInput) {
    imgInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleImageFile(e.target.files[0]);
      }
    });
  }

  if (btnRemovePreview) {
    btnRemovePreview.addEventListener("click", (e) => {
      e.stopPropagation();
      uploadedImageBase64 = null;
      imgInput.value = "";
      if (uploadPreviewContainer) uploadPreviewContainer.style.display = "none";
      if (uploadPlaceholder) uploadPlaceholder.style.display = "flex";
    });
  }

  function handleImageFile(file) {
    if (!file.type.startsWith("image/")) {
      showToast("Harap pilih file gambar yang valid (JPG, PNG, WEBP)!", "warning");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Ukuran gambar melebihi batas 5MB!", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedImageBase64 = e.target.result;
      if (uploadPreviewImg) uploadPreviewImg.src = uploadedImageBase64;
      if (uploadPlaceholder) uploadPlaceholder.style.display = "none";
      if (uploadPreviewContainer) uploadPreviewContainer.style.display = "flex";
      showToast("Gambar berhasil diunggah!", "info");
    };
    reader.readAsDataURL(file);
  }

  // --- DIALOG MODALS ---
  function showDialog(title, desc, buttons = [], icon = "warning") {
    if (!dialogOverlay) return;
    
    dialogTitle.textContent = title;
    dialogDesc.textContent = desc;
    dialogIconGraphic.textContent = icon;
    
    if (icon === "warning") {
      dialogIconGraphic.style.color = "var(--danger-color)";
    } else {
      dialogIconGraphic.style.color = "var(--accent-color)";
    }

    dialogButtonsContainer.innerHTML = "";

    if (buttons.length === 0) {
      buttons = [{ text: "Tutup", class: "btn-secondary", action: closeDialog }];
    }

    buttons.forEach(btnSpec => {
      const btn = document.createElement("button");
      btn.className = `btn ${btnSpec.class || "btn-secondary"}`;
      btn.textContent = btnSpec.text;
      btn.addEventListener("click", () => {
        if (btnSpec.action) btnSpec.action();
        closeDialog();
      });
      dialogButtonsContainer.appendChild(btn);
    });

    dialogOverlay.style.display = "flex";
  }

  function closeDialog() {
    if (dialogOverlay) dialogOverlay.style.display = "none";
  }

  // --- TOAST NOTIFICATIONS ---
  let toastTimeout = null;
  function showToast(message, type = "info") {
    if (!toastNotification) return;

    toastMessage.textContent = message;
    
    // Choose icon
    if (type === "warning" || type === "error") {
      toastIcon.textContent = "error";
      toastIcon.style.color = "var(--danger-color)";
      toastNotification.style.borderColor = "var(--danger-color)";
    } else {
      toastIcon.textContent = "info";
      toastIcon.style.color = "var(--accent-color)";
      toastNotification.style.borderColor = "var(--accent-color)";
    }

    toastNotification.style.display = "flex";
    
    if (toastTimeout) clearTimeout(toastTimeout);
    
    toastTimeout = setTimeout(() => {
      hideToast();
    }, 4000);
  }

  function hideToast() {
    if (toastNotification) toastNotification.style.display = "none";
  }

  if (toastClose) {
    toastClose.addEventListener("click", hideToast);
  }

  // --- GENERATION PIPELINE ---
  let genCancelToken = false;

  if (btnCancelGen) {
    btnCancelGen.addEventListener("click", () => {
      genCancelToken = true;
      hideLoadingOverlay();
      showToast("Proses pembuatan dibatalkan.", "warning");
    });
  }

  function showLoadingOverlay(title = "Menghasilkan Karya...") {
    if (!loadingOverlay) return;
    genCancelToken = false;
    loadingTitle.textContent = title;
    progressBar.style.width = "0%";
    progressPercent.textContent = "0%";
    loadingOverlay.style.display = "flex";
  }

  function updateLoadingProgress(percent, status) {
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (progressPercent) progressPercent.textContent = `${percent}%`;
    if (loadingStatus) loadingStatus.textContent = status;
  }

  function hideLoadingOverlay() {
    if (loadingOverlay) loadingOverlay.style.display = "none";
  }

  // Generate Image trigger
  const btnGenImg = document.getElementById("btn-generate-image");
  if (btnGenImg) {
    btnGenImg.addEventListener("click", () => {
      const prompt = document.getElementById("prompt-image").value.trim();
      const activeRatio = document.querySelector(".ratio-btn.active")?.getAttribute("data-ratio") || "1:1";
      const imageCount = parseInt(document.querySelector(".segment-btn.active")?.getAttribute("data-count") || "1", 10);

      if (!prompt) {
        showToast("Harap masukkan deskripsi prompt terlebih dahulu!", "warning");
        return;
      }

      executeGeneration("image", prompt, { ratio: activeRatio, count: imageCount });
    });
  }

  // Generate Video from Text trigger
  const btnGenVid = document.getElementById("btn-generate-video");
  if (btnGenVid) {
    btnGenVid.addEventListener("click", () => {
      const prompt = document.getElementById("prompt-video").value.trim();
      const duration = parseInt(document.querySelector(".duration-btn.active")?.getAttribute("data-duration") || "5", 10);
      const ratio = document.querySelector(".ratio-video-btn.active")?.getAttribute("data-ratio") || "16:9";

      if (!prompt) {
        showToast("Harap masukkan deskripsi prompt video terlebih dahulu!", "warning");
        return;
      }

      executeGeneration("video", prompt, { duration, ratio });
    });
  }

  // Generate Video from Image trigger
  const btnGenImgVid = document.getElementById("btn-generate-img-video");
  if (btnGenImgVid) {
    btnGenImgVid.addEventListener("click", () => {
      const prompt = document.getElementById("prompt-img-video").value.trim();
      const duration = parseInt(document.querySelector(".img-duration-btn.active")?.getAttribute("data-duration") || "5", 10);

      if (!uploadedImageBase64) {
        showToast("Harap unggah gambar sumber terlebih dahulu!", "warning");
        return;
      }

      if (!prompt) {
        showToast("Harap deskripsikan gerakan animasi video!", "warning");
        return;
      }

      executeGeneration("img-to-video", prompt, { duration, sourceImage: uploadedImageBase64 });
    });
  }

  // REGENERATE ACTIONS
  if (btnAgainVideo) {
    btnAgainVideo.addEventListener("click", () => {
      const activeSubtab = document.querySelector(".subtab-btn.active")?.getAttribute("data-subtab");
      if (activeSubtab === "text-to-video") {
        btnGenVid.click();
      } else if (activeSubtab === "image-to-video") {
        btnGenImgVid.click();
      }
    });
  }

  // GLOBAL EXECUTION ENGINE
  async function executeGeneration(type, prompt, params) {
    // 1. Check Credits
    if (userCredits < 1000) {
      showDialog(
        "Kredit Tidak Cukup",
        "Limit harian telah habis. Silakan kembali besok.",
        [{ text: "Tutup", class: "btn-primary", action: closeDialog }],
        "bolt"
      );
      return;
    }

    // 2. Show spinner with customized titles
    const actionTitle = type === "image" ? "Merespons Gambar..." : "Merespons Video...";
    showLoadingOverlay(actionTitle);

    try {
      // 3. Fake / Real request integration based on Config
      const hasRealAPI = checkConfiguredAPI(type);
      
      // Simulate progress bar movement beautifully
      const durationSteps = 3000; // 3 seconds total simulation
      const intervalMs = 50;
      let elapsed = 0;
      
      const statuses = {
        image: [
          { percent: 10, msg: "Menganalisis prompt teks..." },
          { percent: 25, msg: "Mengonfigurasi jaringan syaraf..." },
          { percent: 45, msg: "Memulai difusi noise laten..." },
          { percent: 65, msg: "Merender detail tekstur..." },
          { percent: 85, msg: "Melakukan upscaling premium..." },
          { percent: 95, msg: "Mengompres hasil gambar..." }
        ],
        video: [
          { percent: 10, msg: "Menganalisis skenario gerakan..." },
          { percent: 25, msg: "Membuat frame kunci awal..." },
          { percent: 50, msg: "Interpolaritas gerak fisika..." },
          { percent: 70, msg: "Menghitung fluks aliran optik..." },
          { percent: 85, msg: "Merender frame video 3D..." },
          { percent: 95, msg: "Mengodekan format MP4 h.264..." }
        ]
      };

      const steps = type === "image" ? statuses.image : statuses.video;

      // Promise-based timer loop for nice smooth UI progress bar
      while (elapsed < durationSteps) {
        if (genCancelToken) return;
        
        await delay(intervalMs);
        elapsed += intervalMs;
        
        const percent = Math.min(Math.round((elapsed / durationSteps) * 100), 98);
        
        // Find corresponding status msg
        let currentStatus = "Sedang bekerja...";
        for (let step of steps) {
          if (percent >= step.percent) {
            currentStatus = step.msg;
          }
        }
        
        updateLoadingProgress(percent, currentStatus);
      }

      // 4. Perform actual API Fetch OR Generate High Quality Demo Placeholders
      let resultsData = [];
      
      if (hasRealAPI) {
        // CALL REAL ENDPOINTS
        resultsData = await callRealAIEndpoints(type, prompt, params);
      } else {
        // RUN HIGH END GRADIENT GRAPHICS DEMO AS FALLBACK
        resultsData = await createDemoResults(type, prompt, params);
      }

      // Complete progress loader
      if (genCancelToken) return;
      updateLoadingProgress(100, "Selesai!");
      await delay(200);
      hideLoadingOverlay();

      // 5. Deduct credit on successful output
      deductCredit();

      // 6. Save results into History
      const timestamp = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      const newHistoryItem = {
        id: "gen_" + Date.now(),
        type: type,
        prompt: prompt,
        date: timestamp,
        results: resultsData,
        params: params
      };

      historyList.unshift(newHistoryItem);
      localStorage.setItem("iagvr_history", JSON.stringify(historyList));
      renderHistoryList();

      // 7. Render dynamic results on the Screen
      displayGeneratedResult(type, newHistoryItem);
      
      // Notify fallback
      if (!hasRealAPI) {
        showToast("Kreasi berhasil! (Berjalan dalam Mode Demo offline)", "info");
      } else {
        showToast("Kreasi AI berhasil diselesaikan!", "info");
      }

    } catch (error) {
      hideLoadingOverlay();
      console.error(error);
      
      // Error dialogue with a Retry button
      showDialog(
        "Gagal Menghasilkan",
        `Gagal menghubungkan ke server AI: ${error.message || error}.`,
        [
          { text: "Batal", class: "btn-outline", action: closeDialog },
          { 
            text: "Coba Lagi", 
            class: "btn-primary", 
            action: () => executeGeneration(type, prompt, params) 
          }
        ],
        "error"
      );
    }
  }

  // Config checking helper
  function checkConfiguredAPI(type) {
    if (typeof window.CONFIG === "undefined") return false;
    
    if (type === "image" && window.CONFIG.API_IMAGE) return true;
    if (type === "video" && window.CONFIG.API_TEXT_VIDEO) return true;
    if (type === "img-to-video" && window.CONFIG.API_IMAGE_VIDEO) return true;
    
    return false;
  }

  // Delay helper
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Real fetch call handler
  async function callRealAIEndpoints(type, prompt, params) {
    const config = window.CONFIG;
    let endpoint = "";
    let body = {};

    if (type === "image") {
      endpoint = config.API_IMAGE;
      body = { prompt: prompt, ratio: params.ratio, count: params.count };
    } else if (type === "video") {
      endpoint = config.API_TEXT_VIDEO;
      body = { prompt: prompt, duration: params.duration, ratio: params.ratio };
    } else if (type === "img-to-video") {
      endpoint = config.API_IMAGE_VIDEO;
      body = { prompt: prompt, duration: params.duration, image: params.sourceImage };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: config.API_HEADERS || { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP Error Status: ${response.status}`);
    }

    const data = await response.json();
    
    // Expecting API to return an array of image URLs or a single video URL in the payload
    // E.g., { results: ["https://..."] } or { video_url: "https://..." }
    if (type === "image") {
      if (data.results && Array.isArray(data.results)) {
        return data.results;
      } else if (data.url) {
        return [data.url];
      }
      throw new Error("Format respons gambar API tidak valid. Mengharapkan daftar URL.");
    } else {
      if (data.video_url) {
        return [data.video_url];
      } else if (data.results && data.results[0]) {
        return [data.results[0]];
      }
      throw new Error("Format respons video API tidak valid. Mengharapkan URL video.");
    }
  }

  // Demo Fallback generator using HTML Canvas to generate ultra beautiful, customized digital gradients
  function createDemoResults(type, prompt, params) {
    return new Promise((resolve) => {
      if (type === "image") {
        const count = params.count || 1;
        const results = [];
        
        for (let i = 0; i < count; i++) {
          const canvas = document.createElement("canvas");
          const width = params.ratio === "16:9" ? 800 : (params.ratio === "9:16" ? 450 : 600);
          const height = params.ratio === "16:9" ? 450 : (params.ratio === "9:16" ? 800 : 600);
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          
          // Draw nice artistic dark premium background gradients
          const grad = ctx.createRadialGradient(width/2, height/2, 20, width/2, height/2, Math.max(width, height));
          const hues = [280, 240, 320, 200, 340, 180];
          const primaryHue = hues[Math.floor(Math.random() * hues.length)];
          const secondaryHue = (primaryHue + 60) % 360;
          
          grad.addColorStop(0, `hsl(${primaryHue}, 70%, 15%)`);
          grad.addColorStop(0.5, `hsl(${secondaryHue}, 50%, 8%)`);
          grad.addColorStop(1, '#05050b');
          
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);
          
          // Draw cyber glow mesh grid
          ctx.strokeStyle = "rgba(139, 92, 246, 0.04)";
          ctx.lineWidth = 1;
          const gridSize = 40;
          for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }

          // Draw some glowing space particles
          for (let p = 0; p < 25; p++) {
            ctx.beginPath();
            const px = Math.random() * width;
            const py = Math.random() * height;
            const pSize = Math.random() * 3 + 1;
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1})`;
            ctx.fill();
            
            // Neon shadow glow on some
            if (p % 5 === 0) {
              ctx.shadowColor = `hsl(${primaryHue}, 80%, 60%)`;
              ctx.shadowBlur = 15;
              ctx.fillStyle = `hsl(${primaryHue}, 85%, 70%)`;
              ctx.fill();
              ctx.shadowBlur = 0; // reset
            }
          }

          // Draw a stylized futuristic abstract planet or graphic to represent "AI Art"
          ctx.shadowColor = `hsl(${secondaryHue}, 80%, 50%)`;
          ctx.shadowBlur = 30;
          const gradientCircle = ctx.createLinearGradient(width/2 - 100, height/2 - 100, width/2 + 100, height/2 + 100);
          gradientCircle.addColorStop(0, `hsl(${secondaryHue}, 85%, 65%)`);
          gradientCircle.addColorStop(1, `hsl(${primaryHue}, 85%, 45%)`);
          
          ctx.beginPath();
          ctx.arc(width/2, height/2, Math.min(width, height) * 0.25, 0, Math.PI*2);
          ctx.fillStyle = gradientCircle;
          ctx.fill();
          ctx.shadowBlur = 0; // reset

          // Overlay nice glass card banner inside image
          ctx.fillStyle = "rgba(15, 15, 30, 0.65)";
          ctx.fillRect(0, height - 80, width, 80);
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.beginPath();
          ctx.moveTo(0, height - 80);
          ctx.lineTo(width, height - 80);
          ctx.stroke();

          // Write short branding text and prompt teaser inside result
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 16px 'Space Grotesk', sans-serif";
          ctx.fillText("iAGvR AI Image Generator", 24, height - 48);
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          ctx.font = "italic 11px sans-serif";
          const displayPrompt = prompt.length > 50 ? prompt.substring(0, 47) + "..." : prompt;
          ctx.fillText(`Prompt: "${displayPrompt}"`, 24, height - 24);

          results.push(canvas.toDataURL("image/jpeg"));
        }
        resolve(results);
      } else {
        // Since video players require mp4 or webm, we can fall back to a high-quality demonstration mp4
        // Or if not available, we can use a high-quality placeholder looped video URL (Creative Commons/Pexels)
        // Which is extremely beautiful and matches the prompt category!
        // We can choose from a list of stunning pre-rendered futuristic looped sample videos
        const demoVideos = [
          "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-with-lights-41551-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-background-1611-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-neon-city-streets-at-night-40292-large.mp4",
          "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-digital-particles-42337-large.mp4"
        ];
        
        // Pick one randomly or based on word matches
        let pickedVideo = demoVideos[0];
        const lowerPrompt = prompt.toLowerCase();
        if (lowerPrompt.includes("space") || lowerPrompt.includes("star") || lowerPrompt.includes("cosmic")) {
          pickedVideo = demoVideos[1];
        } else if (lowerPrompt.includes("city") || lowerPrompt.includes("cyber") || lowerPrompt.includes("neon") || lowerPrompt.includes("street")) {
          pickedVideo = demoVideos[2];
        } else if (lowerPrompt.includes("particle") || lowerPrompt.includes("abstract") || lowerPrompt.includes("glow")) {
          pickedVideo = demoVideos[3];
        } else {
          // select randomly
          pickedVideo = demoVideos[Math.floor(Math.random() * demoVideos.length)];
        }
        
        resolve([pickedVideo]);
      }
    });
  }

  // DISPLAY GENERATED OUTPUT
  function displayGeneratedResult(type, item) {
    // Show results section container
    genResultsSection.style.display = "block";
    resultsTypeBadge.textContent = type === "image" ? "Image Grid" : "AI Video";

    if (type === "image") {
      videoResultsContainer.style.display = "none";
      imageResultsGallery.style.display = "grid";
      imageResultsGallery.innerHTML = "";

      // Dynamic column classes based on image count
      imageResultsGallery.className = "results-gallery";
      if (item.results.length === 2) {
        imageResultsGallery.classList.add("grid-2");
      } else if (item.results.length === 4) {
        imageResultsGallery.classList.add("grid-4");
      }

      // Append image items to gallery
      item.results.forEach((imgUrl, idx) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "gallery-item";
        
        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = `Generated Image ${idx + 1}`;
        img.loading = "lazy";
        
        // Overlay action buttons on hover/touch
        const overlay = document.createElement("div");
        overlay.className = "gallery-overlay";
        
        // Copy Prompt Button
        const btnCopy = document.createElement("button");
        btnCopy.className = "btn-gallery-action";
        btnCopy.title = "Salin Prompt";
        btnCopy.innerHTML = '<span class="material-symbols-rounded">content_copy</span>';
        btnCopy.addEventListener("click", (e) => {
          e.stopPropagation();
          copyToClipboard(item.prompt);
        });

        // Download Button
        const btnDown = document.createElement("a");
        btnDown.className = "btn-gallery-action";
        btnDown.title = "Download";
        btnDown.href = imgUrl;
        btnDown.download = `iAGvR-image-${idx + 1}.jpg`;
        btnDown.innerHTML = '<span class="material-symbols-rounded">download</span>';
        btnDown.addEventListener("click", (e) => e.stopPropagation());

        overlay.appendChild(btnCopy);
        overlay.appendChild(btnDown);
        
        itemDiv.appendChild(img);
        itemDiv.appendChild(overlay);

        // Mobile touch-friendly overlay active state
        itemDiv.addEventListener("click", () => {
          itemDiv.classList.toggle("touch-active");
          // Deactivate others
          document.querySelectorAll(".gallery-item").forEach(other => {
            if (other !== itemDiv) other.classList.remove("touch-active");
          });
        });

        imageResultsGallery.appendChild(itemDiv);
      });

      // Scroll smoothly to output
      genResultsSection.scrollIntoView({ behavior: "smooth" });

    } else {
      // VIDEO
      imageResultsGallery.style.display = "none";
      videoResultsContainer.style.display = "flex";

      const videoUrl = item.results[0];
      resultsVideoPlayer.src = videoUrl;
      resultsVideoPlayer.load();
      
      // Attempt autoplay safely (many browsers block autoplay with sound, but looped videos work better)
      resultsVideoPlayer.play().catch(() => {
        // Autoplay failed, show play icon controls instead
      });

      btnDownloadVideo.href = videoUrl;
      
      // Scroll smoothly to output
      genResultsSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Clipboard Copier
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Prompt berhasil disalin ke papan klip!", "info");
    }).catch(() => {
      showToast("Gagal menyalin prompt.", "warning");
    });
  }

  // --- HISTORY MANAGEMENT ---
  function renderHistoryList() {
    const historyGrid = document.getElementById("history-grid");
    const historyEmpty = document.getElementById("history-empty");

    if (historyList.length === 0) {
      if (historyGrid) historyGrid.style.display = "none";
      if (historyEmpty) historyEmpty.style.display = "flex";
      return;
    }

    if (historyEmpty) historyEmpty.style.display = "none";
    if (historyGrid) {
      historyGrid.style.display = "flex";
      historyGrid.innerHTML = "";

      historyList.forEach(item => {
        const card = document.createElement("div");
        card.className = "history-card glass";

        // Preview image or play button for video
        const preview = document.createElement("div");
        preview.className = "history-preview";

        if (item.type === "image") {
          const img = document.createElement("img");
          img.src = item.results[0]; // first generated image
          img.alt = "History preview";
          img.loading = "lazy";
          preview.appendChild(img);
        } else {
          // video type
          const video = document.createElement("video");
          video.src = item.results[0];
          video.muted = true;
          video.currentTime = 1; // seek slightly
          video.playsInline = true;
          video.preload = "metadata";
          preview.appendChild(video);

          const playIcon = document.createElement("div");
          playIcon.className = "history-play-icon";
          playIcon.innerHTML = '<span class="material-symbols-rounded">play_arrow</span>';
          preview.appendChild(playIcon);
        }

        // Click preview to reload that result back in Generator Screen!
        preview.addEventListener("click", () => {
          switchMainPage("page-generator");
          // Switch to corresponding subtab
          const subtabType = item.type === "img-to-video" ? "image-to-video" : (item.type === "video" ? "text-to-video" : "text-to-image");
          const subtabBtn = document.querySelector(`.subtab-btn[data-subtab="${subtabType}"]`);
          if (subtabBtn) subtabBtn.click();
          
          displayGeneratedResult(item.type, item);
          showToast("Hasil kreasi riwayat dimuat kembali!", "info");
        });

        // Content / Info row
        const info = document.createElement("div");
        info.className = "history-info";

        const badgeRow = document.createElement("div");
        badgeRow.className = "history-type-row";

        const badge = document.createElement("span");
        badge.className = "history-badge";
        badge.textContent = item.type === "image" ? "IMAGE" : (item.type === "video" ? "TEXT TO VID" : "IMG TO VID");

        const date = document.createElement("span");
        date.className = "history-date";
        date.textContent = item.date;

        badgeRow.appendChild(badge);
        badgeRow.appendChild(date);

        const prompt = document.createElement("p");
        prompt.className = "history-prompt";
        prompt.textContent = item.prompt;
        prompt.title = item.prompt;

        info.appendChild(badgeRow);
        info.appendChild(prompt);

        // Actions
        const actions = document.createElement("div");
        actions.className = "history-actions";

        // Download Action
        const btnDownload = document.createElement("a");
        btnDownload.className = "history-btn";
        btnDownload.href = item.results[0];
        btnDownload.download = `iAGvR-creation-${item.id}.${item.type === "image" ? "jpg" : "mp4"}`;
        btnDownload.title = "Download";
        btnDownload.innerHTML = '<span class="material-symbols-rounded">download</span>';

        // Delete Action
        const btnDelete = document.createElement("button");
        btnDelete.className = "history-btn btn-delete";
        btnDelete.title = "Hapus";
        btnDelete.innerHTML = '<span class="material-symbols-rounded">delete</span>';
        btnDelete.addEventListener("click", () => {
          showDialog(
            "Hapus Riwayat",
            "Apakah Anda yakin ingin menghapus kreasi ini dari riwayat?",
            [
              { text: "Batal", class: "btn-outline", action: closeDialog },
              { 
                text: "Hapus", 
                class: "btn-primary text-danger-border", 
                action: () => deleteHistoryItem(item.id) 
              }
            ],
            "delete_sweep"
          );
        });

        actions.appendChild(btnDownload);
        actions.appendChild(btnDelete);

        card.appendChild(preview);
        card.appendChild(info);
        card.appendChild(actions);

        historyGrid.appendChild(card);
      });
    }
  }

  function deleteHistoryItem(itemId) {
    historyList = historyList.filter(item => item.id !== itemId);
    localStorage.setItem("iagvr_history", JSON.stringify(historyList));
    renderHistoryList();
    showToast("Item berhasil dihapus dari riwayat.", "info");
  }

  // --- SETTINGS VIEW CONTROLS ---
  function setupSettingsListeners() {
    const themeToggle = document.getElementById("theme-toggle");
    const btnClearHist = document.getElementById("btn-settings-clear-history");
    const btnClearHistIcon = document.getElementById("btn-clear-history-icon");
    const btnResetSettings = document.getElementById("btn-settings-reset");

    // Theme Switch toggle
    if (themeToggle) {
      themeToggle.addEventListener("change", (e) => {
        const isDark = e.target.checked;
        if (isDark) {
          document.body.classList.add("dark-theme");
          document.body.classList.remove("light-theme");
          localStorage.setItem("iagvr_theme", "dark");
          updateThemeLabel(true);
          showToast("Tema Gelap diaktifkan!", "info");
        } else {
          document.body.classList.remove("dark-theme");
          document.body.classList.add("light-theme");
          localStorage.setItem("iagvr_theme", "light");
          updateThemeLabel(false);
          showToast("Tema Terang diaktifkan!", "info");
        }
      });
    }

    // Clear History actions
    const clearHistoryAction = () => {
      showDialog(
        "Bersihkan Semua",
        "Apakah Anda benar-benar ingin menghapus semua riwayat kreasi Anda secara permanen? Tindakan ini tidak dapat dibatalkan.",
        [
          { text: "Batal", class: "btn-outline", action: closeDialog },
          { 
            text: "Bersihkan Semua", 
            class: "btn-primary text-danger-border", 
            action: () => {
              historyList = [];
              localStorage.removeItem("iagvr_history");
              renderHistoryList();
              showToast("Seluruh riwayat kreasi telah dibersihkan!", "info");
            } 
          }
        ],
        "delete_sweep"
      );
    };

    if (btnClearHist) btnClearHist.addEventListener("click", clearHistoryAction);
    if (btnClearHistIcon) btnClearHistIcon.addEventListener("click", clearHistoryAction);

    // Reset settings action
    if (btnResetSettings) {
      btnResetSettings.addEventListener("click", () => {
        showDialog(
          "Reset Aplikasi",
          "Tindakan ini akan mengembalikan kredit Anda ke 4, mengatur ulang tema ke Gelap, serta membersihkan riwayat kreasi Anda. Lanjutkan?",
          [
            { text: "Batal", class: "btn-outline", action: closeDialog },
            { 
              text: "Reset", 
              class: "btn-primary", 
              action: () => {
                // Clear state
                userCredits = 4;
                lastResetTime = Date.now();
                historyList = [];
                
                localStorage.setItem("iagvr_credits", userCredits);
                localStorage.setItem("iagvr_last_reset", lastResetTime);
                localStorage.removeItem("iagvr_history");
                localStorage.setItem("iagvr_theme", "dark");

                // Update UI elements
                updateCreditUI();
                renderHistoryList();
                
                if (themeToggle) themeToggle.checked = true;
                document.body.classList.add("dark-theme");
                document.body.classList.remove("light-theme");
                updateThemeLabel(true);

                // Clear fields
                document.getElementById("prompt-image").value = "";
                document.getElementById("prompt-video").value = "";
                document.getElementById("prompt-img-video").value = "";
                
                if (btnRemovePreview) btnRemovePreview.click();
                genResultsSection.style.display = "none";

                showToast("Pengaturan aplikasi berhasil di-reset!", "info");
              } 
            }
          ],
          "settings_backup_restore"
        );
      });
    }
  }

  function updateThemeLabel(isDark) {
    const themeDesc = document.getElementById("theme-desc");
    if (themeDesc) {
      themeDesc.textContent = isDark 
        ? "Sedang menggunakan Tema Gelap premium" 
        : "Sedang menggunakan Tema Terang bersih";
    }
  }

});
