// ===============================
// iAGvR Configuration
// ===============================

// Tempel API Key Google AI Studio Anda di bawah ini
const GEMINI_API_KEY = "AQ.Ab8RN6IbxoLKmWjzvMLzj9ijuDQJF7iEmSp3_lACc6zOAS9NFg";

// Endpoint API
const CONFIG = {

  // URL FIXED: Menggunakan endpoint resmi Google Imagen 3 untuk Text-to-Image
  API_IMAGE: `https://googleapis.com{GEMINI_API_KEY}`,

  // Text to Video (Kosongkan jika belum digunakan)
  API_TEXT_VIDEO: "",

  // Image to Video (Kosongkan jika belum digunakan)
  API_IMAGE_VIDEO: "",

  API_HEADERS: {
    "Content-Type": "application/json"
  }

};

// Menyimpan API Key ke window agar bisa diakses secara global oleh fungsi executeGeneration di script.js
window.AI_STUDIO_KEY = GEMINI_API_KEY;

// Agar dapat dipanggil dari script.js
window.CONFIG = CONFIG;
