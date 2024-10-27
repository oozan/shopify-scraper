import express, { Request, Response } from "express";
import puppeteer from "puppeteer";

const app = express();
const port = process.env.PORT || 3000;

app.get("/scrape", async (req: Request, res: Response): Promise<void> => {
  const productUrl = req.query.url;

  if (!productUrl || typeof productUrl !== "string") {
    res.status(400).json({ error: "Missing or invalid URL parameter" });
    return;
  }

  try {
    const result = await scrapeShopifyProductPage(productUrl);
    res.json(result);
  } catch (error) {
    console.error("Error scraping the page:", error);
    res.status(500).json({ error: "Failed to scrape the page" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function scrapeShopifyProductPage(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  // Extract fonts
  const fonts = await page.evaluate(async () => {
    // Function to construct Google Fonts URL
    function constructGoogleFontsURL(family: string, variants: string[]) {
      const baseUrl = "https://fonts.googleapis.com/css2?";
      const familyParam = `family=${encodeURIComponent(
        family
      )}:wght@${variants.join(";")}`;
      const displayParam = "&display=swap";
      return baseUrl + familyParam + displayParam;
    }

    // List of Google Fonts (This is a simplified list. In practice, you'd need to fetch the list from Google Fonts API)
    const googleFontsList = [
      "Roboto",
      "Open Sans",
      "Lato",
      "Montserrat",
      "Source Sans Pro",
      "Nunito Sans",
      "Suisse Intl",
      // ... add more fonts as needed
    ];

    // Collect font families used in computed styles
    const fontFamilies = new Set<string>();
    const elements = Array.from(document.querySelectorAll("body *"));
    elements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      const fontFamily = computedStyle.fontFamily;
      if (fontFamily) {
        fontFamilies.add(fontFamily);
      }
    });

    const fonts = Array.from(fontFamilies).map((family) => {
      // Clean up the family string
      const cleanFamily = family.replace(/['"]/g, "").split(",")[0].trim();

      // Try to find font weight and letter spacing from elements using this font
      let fontWeight = "";
      let letterSpacing = "";

      const elementsUsingFont = elements.filter((el) => {
        const computedStyle = window.getComputedStyle(el);
        return computedStyle.fontFamily === family;
      });

      if (elementsUsingFont.length > 0) {
        const computedStyle = window.getComputedStyle(elementsUsingFont[0]);
        fontWeight = computedStyle.fontWeight;
        letterSpacing = computedStyle.letterSpacing;
      }

      // Check if the font is available on Google Fonts
      let fontUrl = "";
      let variants = fontWeight || "400";

      if (googleFontsList.includes(cleanFamily)) {
        fontUrl = constructGoogleFontsURL(cleanFamily, [variants]);
      }

      return {
        family: family,
        variants: variants,
        letterSpacings: letterSpacing || "",
        fontWeight: fontWeight || "",
        url: fontUrl,
      };
    });

    return fonts;
  });

  // Extract primary button styles
  const primaryButton = await page.evaluate(() => {
    // Potential selectors for the "Add to Cart" button
    const selectors = [
      'form[action*="/cart/add"] [type="submit"]',
      'button[name="add"]',
      'button[type="submit"].product-form__submit',
      'form[action*="/cart/add"] button',
      "button.add-to-cart",
      "button.AddToCart",
      "button#AddToCart",
      'input[type="submit"][value*="Add"]',
      "button.btn--add-to-cart",
      "button.product-form__cart-submit",
      "button.product-form--atc-button",
    ];

    let button = null;
    for (const selector of selectors) {
      button = document.querySelector(selector);
      if (button) {
        break;
      }
    }

    if (!button) {
      return {};
    }

    const computedStyle = window.getComputedStyle(button);

    return {
      fontFamily: computedStyle.fontFamily,
      fontSize: computedStyle.fontSize,
      lineHeight: computedStyle.lineHeight,
      letterSpacing: computedStyle.letterSpacing,
      textTransform: computedStyle.textTransform,
      textDecoration: computedStyle.textDecorationLine,
      textAlign: computedStyle.textAlign,
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
      borderColor: computedStyle.borderColor,
      borderWidth: computedStyle.borderWidth,
      borderRadius: computedStyle.borderRadius,
    };
  });

  await browser.close();

  return {
    fonts: fonts,
    primaryButton: primaryButton,
  };
}
