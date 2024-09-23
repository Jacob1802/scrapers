import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";
import fs from "graceful-fs";
import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from 'telegraf';

async function scrapeData() {
    const botToken = process.env.TELEGRAM_TOKEN
    const bot = new Telegraf(botToken, { 
        telegram: { 
            timeout: 60000,
        }
    });
    try {
        await bot.launch();
      } catch (err) {
        console.error("Error launching bot:", err);
    }
    // Read the file synchronously
    const data = fs.readFileSync("specials.json", 'utf-8');

    // Parse the JSON data
    const existingSpecials = JSON.parse(data);

    console.log(existingSpecials)

    const res = await gotScraping({
        url: "https://wholefarms.com.au/search?dd=1&q%5B%5D=special%3A1&q%5B%5D=category%3Abutcher"
    });

    // Check the response status
    console.log(res.statusCode);

    // Read and log the response body as text
    const page = res.body;

    const $ = cheerio.load(page);

    // Get the text content of all <script> tags
    const scriptContent = $('script').map((i, el) => $(el).html()).get();

    // Find the script tag that contains the gtmDataLayer variable
    const dataScript = scriptContent.find(content => content.includes('window.gtmDataLayer'));

    if (dataScript) {
        // Extract JSON data using regex
        const jsonData = dataScript.match(/window\.gtmDataLayer = (\[.*?\]);/)[1];

        // Parse the JSON
        const parsedData = JSON.parse(jsonData);

        // Define the data you want to save
        if (JSON.stringify(existingSpecials.items) !== JSON.stringify(parsedData[1].ecommerce.items)) {
            const dataToWrite = {
                items: parsedData[1].ecommerce.items
            };
            let message = "New specials:\n"
            dataToWrite.items.forEach(item => {
                message += `Item: ${item.item_name}, Price: ${item.price} ${item.currency}\n`;
            });
            await sendTelegramMessage(bot, message)
            // Write the data to a file as JSON
            try {
                fs.writeFile("scraped_data.json", JSON.stringify(dataToWrite, null, 2));
                console.log("Data successfully written to scraped_data.json");
            } catch (err) {
                console.error("Error writing data to file:", err);
            }
        } 
    } else {
        console.log("gtmDataLayer not found in script tags.");
    }
}


async function sendTelegramMessage(bot, message) {
    const chatId = process.env.CHAT_ID
    try {
      await bot.telegram.sendMessage(chatId, message);
      console.log(`Message sent to chat ID ${chatId}`);
    } catch (error) {
      console.error('Error sending message:', error);
    }
}


scrapeData();