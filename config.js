// iAGvR Configuration File
// Di sini Anda dapat memasukkan endpoint API nyata untuk layanan AI Anda.
// Jika API di bawah kosong, aplikasi akan berjalan dalam mode demo / simulasi berkualitas tinggi.

const CONFIG = {
  // Hubungkan ke API Generator Gambar Anda (misalnya: Midjourney, Stable Diffusion, DALL-E, atau Gemini Image API)
  API_IMAGE: "AQ.Ab8RN6IbxoLKmWjzvMLzj9ijuDQJF7iEmSp3_lACc6zOAS9NFg",

  // Hubungkan ke API Generator Video Anda (misalnya: Runway, Luma, Kling, Pika, Sora, dll)
  API_TEXT_VIDEO: " AQ.Ab8RN6IbxoLKmWjzvMLzj9ijuDQJF7iEmSp3_lACc6zOAS9NFg",

  // Hubungkan ke API Image to Video Anda
  API_IMAGE_VIDEO: "AQ.Ab8RN6IbxoLKmWjzvMLzj9ijuDQJF7iEmSp3_lACc6zOAS9NFg",

  // Konfigurasi Tambahan jika diperlukan (seperti custom headers atau API token)
  API_HEADERS: {
    "Content-Type": "application/json",
    // "Authorization": "Bearer YOUR_API_KEY"
  }
};

// Pastikan global CONFIG dapat diakses
if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
