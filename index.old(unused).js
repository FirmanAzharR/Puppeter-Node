const puppeteer = require("puppeteer");

async function accessWeb() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    defaultViewport: null, // biar fullscreen native
    args: ["--start-fullscreen"], // opsi fullscreen
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:5173/login", { waitUntil: "networkidle2" });

  await page.waitForSelector('input[placeholder="Enter your username"]');
  await page.type(
    'input[placeholder="Enter your username"]',
    "admin@jogjaprov.go.id"
  );

  await page.waitForSelector('input[placeholder="Enter your password"]');
  await page.type('input[placeholder="Enter your password"]', "12345678");

  await page.click('button[type="submit"]');

  // Tunggu halaman redirect setelah login
  await page.waitForNavigation();

  console.log("Login berhasil!");

  // go to halaman counting#cctv-section
  await page.goto("http://localhost:5173/counting", {
    waitUntil: "networkidle2",
  });

  console.log("Berhasil pindah ke halaman counting CCTV section!");

  // Tunggu sampai tombol 'Perbatasan Kota' muncul
  await page.waitForFunction(
    () => {
      return Array.from(document.querySelectorAll("button")).some((btn) =>
        btn.innerText.includes("Perbatasan Kota")
      );
    },
    { timeout: 5000 }
  );

  // Klik tombol 'Perbatasan Kota'
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const kotaButton = buttons.find((btn) =>
      btn.innerText.includes("Perbatasan Kota")
    );
    if (kotaButton) kotaButton.click();
  });

  console.log("Tombol Perbatasan Kota berhasil diklik!");

  // Delay manual 1 detik
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Tunggu sampai tombol muncul
  await page.waitForFunction(
    () => {
      return Array.from(document.querySelectorAll("button")).some((btn) =>
        btn.innerText.includes("Start Counting")
      );
    },
    { timeout: 5000 }
  ); // kasih timeout maksimal 5 detik

  // Klik tombol Start Counting
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const startButton = buttons.find((btn) =>
      btn.innerText.includes("Start Counting")
    );
    if (startButton) startButton.click();
  });

  console.log("Tombol Start Counting berhasil diklik!");

  // Tunggu sampai element video list Condong Catur muncul
  await page.waitForFunction(
    () => {
      return Array.from(document.querySelectorAll("h4")).some((h4) =>
        h4.innerText.includes("Condong Catur")
      );
    },
    { timeout: 5000 }
  );

  // Klik div absolute inset-0 milik Condong Catur
  await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll("h4"));
    const targetTitle = titles.find((h4) =>
      h4.innerText.includes("Condong Catur")
    );
    if (targetTitle) {
      const videoContainer = targetTitle.closest("div.absolute.inset-0");
      if (videoContainer) videoContainer.click();
    }
  });

  console.log("Video Condong Catur berhasil diklik!");

  await page.waitForFunction(
    () => {
      const video = document.querySelector("video");
      return video && video.readyState === 4;
    },
    { timeout: 30000 }
  );
  // Tunggu sampai tombol 'Start Counting Object' muncul
  await page.waitForFunction(
    () => {
      return Array.from(document.querySelectorAll("button")).some((btn) =>
        btn.innerText.includes("Start Counting Object")
      );
    },
    { timeout: 30000 }
  );

  // Klik tombol 'Start Counting Object'
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const startCountingBtn = buttons.find((btn) =>
      btn.innerText.includes("Start Counting Object")
    );
    if (startCountingBtn) startCountingBtn.click();
  });

  console.log("Tombol Start Counting Object di video berhasil diklik!");

  console.log("Tombol Start Counting diklik, proses counting berjalan...");

  // Tunggu 1 menit (60000 ms)
  await new Promise((resolve) => setTimeout(resolve, 10000));

  console.log("1 menit berlalu, cari tombol Stop Counting");

  // Klik tombol Stop Counting
  await page.waitForFunction(
    () => {
      return Array.from(document.querySelectorAll("button")).some((btn) =>
        btn.innerText.includes("Stop Counting")
      );
    },
    { timeout: 10000 }
  );

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const stopCountingBtn = buttons.find((btn) =>
      btn.innerText.includes("Stop Counting")
    );
    if (stopCountingBtn) stopCountingBtn.click();
  });

  console.log("Tombol Stop Counting berhasil diklik setelah 1 menit!");

  // Tunggu tombol 'Kirim Data' muncul
  await page.waitForFunction(
    () => {
      return Array.from(document.querySelectorAll("button")).some(
        (btn) => btn.innerText.trim() === "Kirim Data"
      );
    },
    { timeout: 10000 }
  );

  // Klik tombol 'Kirim Data'
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const kirimDataBtn = buttons.find(
      (btn) => btn.innerText.trim() === "Kirim Data"
    );
    if (kirimDataBtn) kirimDataBtn.click();
  });

  console.log("Tombol Kirim Data berhasil diklik!");

  // Tunggu dan tekan back to list'
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // Klik tombol 'Kirim Data'
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const kirimDataBtn = buttons.find(
      (btn) => btn.innerText.trim() === "Back to List"
    );
    if (kirimDataBtn) kirimDataBtn.click();
  });
}

accessWeb();
