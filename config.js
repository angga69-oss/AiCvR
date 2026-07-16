// ===============================
// iAGvR Configuration
// ===============================

// Tempel Access Token Hugging Face Anda di bawah ini
const HF_TOKEN = "hf_GARmhnVKFMnFBkGwpRvdaaLNTNmhRPiRbED ";

// Endpoint API
const CONFIG = {

  // Text to Image
  API_IMAGE: "https://router.huggingface.co/v1/images/generations",

  // Text to Video
  API_TEXT_VIDEO: "",

  // Image to Video
  API_IMAGE_VIDEO: "",

  API_HEADERS: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${HF_TOKEN}`
  }

};

// Agar dapat dipanggil dari script.js
window.CONFIG = CONFIG;
