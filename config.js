// ===============================
// iAGvR Configuration
// ===============================

// Tempel API Key Google AI Studio Anda di bawah ini
const GEMINI_API_KEY = "AQ.Ab8RN6IbxoLKmWjzvMLzj9ijuDQJF7iEmSp3_lACc6zOAS9NFg";

// Endpoint API
const CONFIG = {

  // Google AI Studio - Gemini 1.5 Flash Endpoint (Text & Multimodal)
  // Catatan: Jika ingin menggunakan model pembuat gambar Imagen 3, Anda tinggal mengganti nama modelnya di URL ini
  API_IMAGE: `https://googleapis.com{GEMINI_API_KEY}`,

  // Text to Video (Kosongkan atau isi jika ada endpoint video pihak ketiga)
  API_TEXT_VIDEO: "",

  // Image to Video (Kosongkan atau isi jika ada endpoint video pihak ketiga)
  API_IMAGE_VIDEO: "",

  // Headers wajib untuk pengiriman data ke Google AI Studio dengan metode POST
  API_HEADERS: {
    "Content-Type": "application/json"
  }

};

// Menyimpan API Key ke window agar bisa diakses secara global oleh fungsi executeGeneration di script.js
window.AI_STUDIO_KEY = GEMINI_API_KEY;

// Agar dapat dipanggil dari script.js
window.CONFIG = CONFIG;
