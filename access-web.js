import puppeteer from "puppeteer";
import { promises as fs } from "fs";

const url = "http://localhost:5173"; // Base URL for the application

// Delay helper
const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const delayMinutes = (minutes) => {
  return new Promise((resolve) => setTimeout(resolve, minutes * 60 * 1000));
};


// Logger helper
const logInfo = (message) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
};

// Global setup
const browserOptions = {
  headless: false,
  executablePath:
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  defaultViewport: null,
  args: ["--start-fullscreen"],
};

//Go To Page
const NavigateToPage = async (page, url) => {
  await page.goto(url, { waitUntil: "networkidle2" });
  logInfo(`Navigate to page -> ${(page, url)}`);
  await delay(1500);
};

const Login = async (page) => {
  await NavigateToPage(page, `${url}/login`);
  await page.waitForSelector('input[placeholder="Enter your username"]');
  await page.type(
    'input[placeholder="Enter your username"]',
    "admin@jogjaprov.go.id"
  );
  await page.waitForSelector('input[placeholder="Enter your password"]');
  await page.type('input[placeholder="Enter your password"]', "gedanggoreng");
  await page.click('button[type="submit"]');
  await page.waitForNavigation();
  logInfo("Login success!");
};

const AccessButton = async (page, buttonName) => {
  try {
    await page.waitForFunction(
      (label) => {
        return Array.from(document.querySelectorAll("button")).some((btn) =>
          btn.innerText.includes(label)
        );
      },
      { timeout: 5000 },
      buttonName
    );

    await page.evaluate((label) => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const someButton = buttons.find((btn) => btn.innerText.includes(label));
      if (someButton) someButton.click();
    }, buttonName);

    await delay(1500);
    logInfo(`Button '${buttonName}' clicked!`);
  } catch (err) {
    console.error(`[ERROR] Failed to click button '${buttonName}'`, err);
    throw err;
  }
};

const AccessVideo = async (page, videoTitle) => {
  // awit util video list ready
  await page.waitForFunction(
    (title) => {
      //get title from h4 elements
      return Array.from(document.querySelectorAll("h4")).some((h4) =>
        h4.innerText.includes(`${title}`)
      );
    },
    { timeout: 5000 },
    videoTitle
  );

  // Click closest div wrapper on video
  await page.evaluate((title) => {
    const titles = Array.from(document.querySelectorAll("h4"));
    const targetTitle = titles.find((h4) => h4.innerText.includes(`${title}`));
    if (targetTitle) {
      const videoContainer = targetTitle.closest("div.absolute.inset-0");
      if (videoContainer) videoContainer.click();
    }
  }, videoTitle);

  logInfo(`Video '${videoTitle}' Clicked!`);

  // Wait until video ready or play
  await page.waitForFunction(
    () => {
      const video = document.querySelector("video");
      return video && video.readyState === 4;
    },
    { timeout: 30000 }
  );

  logInfo(`Video '${videoTitle}' and tensor model is ready!`);
};

const loadFileList = async () => {
  const data = await fs.readFile("./list.json", "utf-8");
  return JSON.parse(data);
};

//main function
const accessWeb = async () => {
  let browser = null;
  try {
    //load file labels button and title
    const labels = await loadFileList();

    //Open Browser
    browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();
    logInfo("Browser new page opened.");
    await delay(1500);
    //End

    await Login(page); //login
    await NavigateToPage(page, `${url}/counting`); //navigate counting

    for (const { buttonLabel, videoTitle } of labels) {
      await AccessButton(page, buttonLabel); //click perbatasan kota
      await AccessButton(page, "Start Counting"); //click start counting
      await AccessVideo(page, videoTitle); //click video condong catur
      await AccessButton(page, "Start Counting Object"); //click start counting object
      await delayMinutes(90); //time video counting (on ms)
      await AccessButton(page, "Stop Counting"); //click stop counting object
      await delay(2000);
      await AccessButton(page, "Kirim Data"); //click kirim data
      await delay(3000);
      await AccessButton(page, "Back to List"); //click back to list
      await delay(3000);
    }
  } catch (error) {
    console.error(`[ERROR] ${new Date().toISOString()} - error:`, error);
  } finally {
    await delay(1000);
    await browser.close();
    logInfo("Done accessing web. Browser closed.");
  }
};

export default accessWeb;
