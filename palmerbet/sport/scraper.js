import fs from "graceful-fs";

(async () => {

    const res = await fetchUpcomingSports(1)
    const filteredResults = filterNecessaryFields(res);
    console.log(filteredResults.length)
    console.log(filteredResults.matches.length)

    fs.writeFileSync("results.json", JSON.stringify(filteredResults.matches, null, 2))

})();


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

function filterNecessaryFields(events) {
    return events.map(event => ({
        eventId: event.eventId,
        sportType: event.sportType,
        startTime: event.startTime,
        status: event.status,
        homeTeam: {
            title: event.homeTeam?.title || null,
            win: {
                price: event.homeTeam?.win?.price || null,
                title: event.homeTeam?.win?.title || null
            }
        },
        awayTeam: {
            title: event.awayTeam?.title || null,
            win: {
                price: event.awayTeam?.win?.price || null,
                title: event.awayTeam?.win?.title || null
            }
        }
    }));
}





const sports = ["Basketball", "American Football", "Soccer", "Baseball", "Rugby League", "Tennis", "Cricket", "Ice Hockey", "Martial Arts", "Boxing", "ESports", "Politics", "Australian Rules", "BoostedOdds", "Cycling", "Darts", "Entertainment", "Golf", "Handball", "JockeyChallenge", "MotorRacing", "Rugby Union", "Snooker", "Volleyball"]



// https://fixture.palmerbet.online/fixtures/sports/b26e5acc-02ff-4b22-ae69-0491fbd2500e/matches?sportType=basketball&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/f5002b1a-3dab-5f4d-990e-25e1d1f977a9/matches?sportType=americanfootball&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/b4073512-cdd5-4953-950f-3f7ad31fa955/matches?sportType=soccer&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/b9a61a6f-4cc3-400a-8495-ccee7c7d7779/matches?sportType=baseball&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/cf404de1-1953-4d55-b92e-4e022f186b22/matches?sportType=rugbyleague&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/9d6bbedd-0b09-4031-9884-e264499a2aa5/matches?sportType=tennis&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/95450aca-2128-4e2f-b0b8-8f4284522c20/matches?sportType=cricket&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/a4d555da-0ac5-47ca-b2a7-7872d04335dc/matches?sportType=icehockey&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/7ee8e39f-6bec-45c1-b484-28023ce0dfce/matches?sportType=martialarts&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/b837bc24-9f8d-4876-a7ea-584d3944b08f/matches?sportType=boxing&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/a5150c01-0a8e-41d5-b2b6-f6638c7fcbb1/matches?sportType=esports&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/fe2b1527-89d2-417b-818a-382ed1496ded/matches?sportType=australianrules&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/da92102b-8eb1-44f6-a51f-94ad9c2ec1eb/markets?sportType=cycling&pageSize=1000&channel=website
// https://fixture.palmerbet.online/fixtures/sports/4297c289-eb92-fc62-a457-1730f8da9431/markets?sportType=darts&pageSize=1000&channel=website
// https://fixture.palmerbet.online/fixtures/sports/b338b287-2f47-ebcc-de59-d09b1dd6b087/markets?sportType=entertainment&pageSize=1000&channel=website
// https://fixture.palmerbet.online/fixtures/sports/24293d3e-548b-4e71-933f-d695abc15322/markets?sportType=golf&pageSize=1000&channel=website
// https://fixture.palmerbet.online/fixtures/sports/4ea6fdc7-ab8f-43b4-a71d-311bf0b1b4e4/matches?sportType=handball&pageSize=25&channel=website


// https://fixture.palmerbet.online/fixtures/sports/ed86b3aa-edf9-41aa-9e55-46a70560b88b/markets?sportType=politics&pageSize=1000&channel=website
// https://fixture.palmerbet.online/fixtures/sports/c49ecbe2-13a6-b7a6-ab5f-f797ec7d336d/markets?sportType=jockeychallenge&pageSize=1000&channel=website
// https://fixture.palmerbet.online/fixtures/sports/57189151-1a2d-403e-b4d3-1b14f58e0350/markets?sportType=motorracing&pageSize=1000&channel=website


// https://fixture.palmerbet.online/fixtures/sports/5bfcf787-edfc-48f4-b328-1d221aa07ae0/matches?sportType=rugbyunion&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/3c95325b-c463-4c46-8da8-231eea9af6d9/matches?sportType=snooker&pageSize=25&channel=website
// https://fixture.palmerbet.online/fixtures/sports/5ecdf785-3d5f-45ae-858b-597ca028c272/matches?sportType=volleyball&pageSize=25&channel=website
