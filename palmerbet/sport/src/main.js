// Import Apify SDK, a toolkit for building web scraping actors (See documentation at https://docs.apify.com/sdk/js/)
import { Actor } from 'apify';

// This project uses ECMAScript Modules (ESM), requiring explicit file extensions in imports.
// More information about ESM in Node.js can be found here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// import { router } from './routes.js';

// Initialize the Actor environment. Always recommended to call init() at the beginning of an Actor script.
await Actor.init();

// Retrieve the input provided to the Actor (input schema is defined in input_schema.json).
const input = await Actor.getInput();

async function fetchUpcomingSports(maxResults) {
    const res = await fetch(`https://fixture.palmerbet.online/fixtures/sports/nexttoplay?pageSize=${maxResults}&channel=website`, {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9",
          "priority": "u=1, i",
          "sec-ch-ua": "\"Brave\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "cross-site",
          "sec-gpc": "1",
          "Referer": "https://www.palmerbet.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
    });

    if (res.status === 404) {
        const errorResponse = await res.json();
        console.log(`No races available ${errorResponse}`);
        process.exit(1);  // Exit the process with a failure code
    }   
    
    return await res.json();
}

try {
    const res = await fetchUpcomingSports(input.maxResults);
    await Actor.pushData(res.matches);
} catch (error) {
    console.error('Error:', error.message);
} finally {
    // Gracefully exit the Actor process. It's recommended to quit all Actors with an exit().
    await Actor.exit();
}