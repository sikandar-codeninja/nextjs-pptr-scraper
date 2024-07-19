import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

export async function scrapeWebsiteDetails(url: string): Promise<string> {
  console.log("dirname", __dirname);
  let browser = null;
  let data: string = "";

  try {
    // Find the Puppeteer cache directory
    const puppeteerCacheDir = path.resolve(process.cwd(), ".cache/puppeteer");
    const chromePath = path.join(
      puppeteerCacheDir,
      "chrome",
      "linux-126.0.6478.182",
      "chrome-linux64",
      "chrome"
    );

    // Verify if the chrome executable exists
    if (!fs.existsSync(chromePath)) {
      throw new Error(`Chrome executable not found at ${chromePath}`);
    }

    console.log(`Using Chrome executable at: ${chromePath}`);

    browser = await puppeteer.launch({
      headless: true,
      executablePath: chromePath,
    });

    const page = await browser.newPage();
    const navigationPromise = page.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    // Timeout settings can be adjusted for better performance
    page.setDefaultNavigationTimeout(60000); // 60 seconds

    await page.goto(url, { waitUntil: "networkidle2" });
    await navigationPromise;
    data = await page.evaluate(() => {
      const phoneRegex =
        /\+?\d{1,4}[\s-]?\(?\d{1,4}?\)?[\s-]?\d{1,4}[\s-]?\d{1,9}/g;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

      const getTextFromNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent?.trim().replace(/\s+/g, " ") || "";
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toUpperCase();
          if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(tagName)) {
            return "";
          }
          return Array.from(element.childNodes).map(getTextFromNode).join(" ");
        }
        return "";
      };

      const head = {
        title: document.querySelector("title")?.textContent?.trim() || "",
        description:
          document
            .querySelector('meta[name="description"]')
            ?.getAttribute("content")
            ?.trim() || "",
      };

      const dataFromHeadings =
        document.querySelector("h1")?.textContent?.trim() ||
        document.querySelector("h2")?.textContent?.trim() ||
        "";

      const descriptionFromHeadTag =
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content")
          ?.trim() || "";

      const phoneNumbers =
        Array.from(document.querySelectorAll('a[href^="tel:"]'))
          .map((el) => el.getAttribute("href")?.replace("tel:", ""))
          .filter(Boolean) || [];

      const emailAddresses =
        Array.from(document.querySelectorAll('a[href^="mailto:"]'))
          .map((el) => el.getAttribute("href")?.replace("mailto:", ""))
          .filter(Boolean) || [];

      const dataFromHTMLBody = Array.from(
        document.querySelectorAll("main, span")
      )
        .map(getTextFromNode)
        .join(", ");

      const dataFromHTMLFooter = Array.from(
        document.querySelectorAll("address, .contact-info, footer")
      )
        .map(getTextFromNode)
        .join(" ");

      let scrapedData = {
        dataFromHeadings,
        descriptionFromHeadTag,
        dataFromHTMLBody,
        phoneNumbers,
        emailAddresses,
        head,
        dataFromHTMLFooter,
      };

      // Convert to JSON string to measure length and truncate if necessary
      let jsonString = JSON.stringify(scrapedData);
      if (jsonString.length > 3000) {
        // Truncate content fields to reduce length
        scrapedData = {
          ...scrapedData,
          descriptionFromHeadTag: descriptionFromHeadTag,
          dataFromHTMLBody: dataFromHTMLBody.substring(0, 2000),
          dataFromHTMLFooter: dataFromHTMLFooter.substring(0, 1500),
        };
        jsonString = JSON.stringify(scrapedData);
      }

      return jsonString;
    });
    await browser.close();
  } catch (error) {
    console.error("Failed to scrape the website:", error);
    return `Failed to scrape the website. Please check the logs. ${error}`;
  }
  return data;
}
