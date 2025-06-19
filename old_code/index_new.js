const puppeteer = require("puppeteer");

// Delay helper
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Logger helper
function logInfo(message) {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
}

// Global setup
const browserOptions = {
  headless: false,
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  defaultViewport: null,
  args: ["--start-fullscreen"],
};

// Login function
async function login(page) {
  logInfo("Mengakses halaman login...");
  await page.goto("http://localhost:5173/login", { waitUntil: "networkidle2" });

  await page.type(
    'input[placeholder="Enter your username"]',
    "admin@jogjaprov.go.id"
  );
  await page.type('input[placeholder="Enter your password"]', "12345678");
  await page.click('button[type="submit"]');

  await page.waitForNavigation();
  logInfo("Login berhasil!");
}

// Navigasi ke halaman counting
async function navigateToCounting(page) {
  logInfo("Menuju halaman counting...");
  await page.goto("http://localhost:5173/counting", {
    waitUntil: "networkidle2",
  });
}

// Klik tombol berdasarkan innerText
async function clickButtonByText(page, text, timeout = 10000) {
  await page.waitForFunction(
    (label) => {
      return Array.from(document.querySelectorAll("button")).some((btn) =>
        btn.innerText.includes(label)
      );
    },
    { timeout },
    text
  );

  await page.evaluate((label) => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const targetButton = buttons.find((btn) => btn.innerText.includes(label));
    if (targetButton) targetButton.click();
  });

  logInfo(`Tombol '${text}' berhasil diklik!`);
}

// Klik video berdasarkan judul
async function clickVideoByTitle(page, titleText) {
  await page.waitForFunction(
    (title) => {
      return Array.from(document.querySelectorAll("h4")).some((h4) =>
        h4.innerText.includes(title)
      );
    },
    { timeout: 5000 },
    titleText
  );

  await page.evaluate((title) => {
    const titles = Array.from(document.querySelectorAll("h4"));
    const targetTitle = titles.find((h4) => h4.innerText.includes(title));
    if (targetTitle) {
      const videoContainer = targetTitle.closest("div.absolute.inset-0");
      if (videoContainer) videoContainer.click();
    }
  });

  logInfo(`Video '${titleText}' berhasil diklik!`);
}

// Menjalankan counting object di video
async function startCountingObject(page) {
  await page.waitForFunction(
    () => {
      const video = document.querySelector("video");
      return video && video.readyState === 4;
    },
    { timeout: 30000 }
  );

  await clickButtonByText(page, "Start Counting Object", 30000);
  logInfo("Proses counting object dimulai...");
}

// Stop counting dan kirim data
async function stopCountingAndSendData(page) {
  logInfo("Menunggu tombol 'Stop Counting'...");
  await clickButtonByText(page, "Stop Counting", 10000);

  logInfo("Menunggu tombol 'Kirim Data'...");
  await clickButtonByText(page, "Kirim Data", 10000);

  //kembali ke list cctv
  await delay(3000);
  await clickButtonByText(page, "Back to List", 10000);
  logInfo("Data berhasil dikirim dan kembali ke list.");
}

// Main function dengan error handling
async function accessWeb() {
  const browser = await puppeteer.launch(browserOptions);
  const page = await browser.newPage();
  page.setDefaultTimeout(30000); // Global timeout untuk semua operasi di page

  try {
    await login(page);
    await navigateToCounting(page);

    await clickButtonByText(page, "Perbatasan Kota");
    await delay(1000);
    await clickButtonByText(page, "Start Counting");

    await clickVideoByTitle(page, "Condong Catur");
    await startCountingObject(page);

    await delay(10000); // Delay counting 1 menit
    logInfo("1 menit counting berlalu...");

    await stopCountingAndSendData(page);
  } catch (error) {
    console.error(
      `[ERROR] ${new Date().toISOString()} - Terjadi error:`,
      error
    );
  } finally {
    await browser.close();
    logInfo("Browser ditutup.");
  }
}

accessWeb();
