require("dotenv").config();

const fs = require('fs');
const https = require('https');
const Eris = require("eris");
const ytdl = require('ytdl-core');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { create } = require("domain");
const { connected } = require("process");
const { randomInt } = require("crypto");
const { stringify } = require("querystring");

const mathjs = require('mathjs');
const { match } = require("assert");
const { error } = require("console");

/*
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  });
  await page.goto('https://twitter.com/', {
    waitUntil: 'networkidle2',
  });
  await page.screenshot({ path: 'example.png' });
 
  await browser.close();
})(); */

const log = (...arg) => {
    if (process.env.DEBUG && process.env.DEBUG.toLowerCase() === 'true') {
        console.log(...arg);
    }
};

function DownloadVideo(url) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream("file.mp4");

        const request = https.get(url, function(response) {
            response.pipe(file);
            
            file.on('end', function(...a) {
                log('end');
                resolve(file);
            });
            
            
            file.on('finish', function(...a) {
                log('done?');
                resolve(file);
            });
        });
    });
}

var bot = new Eris(process.env.MAJORITA_TOKEN);

bot.on("ready", () => { // When the bot is ready
    log("Ready!"); // Log "Ready!"
});

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns the sum of a dnd dice.
 * @param {number} dice Number of dice.
 * @param {number} sides Number of sides.
 */
function rollDndDiceInt(dice, sides) {
    log("Amount of dice: " + dice + " sides: " + sides)
    let rolls = [];
    let sum = 0;
    for (let i = 0; i < dice; i++) {
      let roll = getRandomInt(1, sides)
      sum += roll
      rolls.push(roll)
      //log('roll ' + (1 + i) + ': ' + roll);
    }
    log('sum of rolls: ' + sum);
    return {
        rolls: rolls,
        sum: sum,
    };
}

bot.on("messageCreate", async (msg) => { // When a message is created
    //log(msg.author.username + "#" + msg.author.discriminator + ": " + msg.content);
    
    if( msg.author.bot ) { 
        return;
    }
    //(?<diceroll>\d+d\d+(\s+)?[-+*\/]?(\s+)?(\d+[^d])?)
    //(?<diceroll>\d+d\d+)

    //dice roll command
    matches = msg.content.match(/(\d+d\d+)/ig)

    if (matches) {

        try {
            let diceRolls = [];
            let totalDiceRolls = 0;
            let maxDiceRolls = 500;

            m = msg.content.replace(/(\d+d\d+)/ig, (roll) => {
                let dice = roll.split(/d/i); //1d6 = roll 1, 6 sided dice
                totalDiceRolls += dice[0];
                if (totalDiceRolls > maxDiceRolls) {
                    log('Warning! Total dice to roll, ' + totalDiceRolls +', exceed max of, ' + maxDiceRolls)
                    return;
                }
                else {
                    let d = rollDndDiceInt(dice[0], dice[1]);
                    diceRolls.push(d.rolls);
                    return d.sum;
                }
            });

            
            if (totalDiceRolls > maxDiceRolls) {

                let reply = '';
                let emote = '';
                let rand = 0;
                rand = getRandomInt(1, 10);

                log ('random number: ' + rand)
                if (rand <= 5) {        //0 - 5 50%
                    reply = 'Too many dice!';
                }
                else if (rand <= 8) {   //5 - 8 30%
                    reply = 'Too many dice, friend';
                }
                else {                  //8 - 10 20%
                    reply = 'You trying to run me out of business with this amount of dice rolls?';
                }

                bot.createMessage(msg.channel.id, reply + ' *(rolled dice exceed ' + maxDiceRolls + ')*' );
                if (emote != '') {
                    bot.createMessage(msg.channel.id, emote);
                }
                return;
            }

            //log(msg.content);
            //log(m)
            //log(diceRolls)
            let rolls = diceRolls.join(', ')
            //log('lenth: ' + rolls.length)
            //log(rolls)    
            let sum = mathjs.evaluate(m)
            //log(sum)



            
            let maxLen = 300
            if (rolls.length > maxLen) {
                rolls = rolls.substr(0, maxLen) + '...'
                //log('roll slice: ' + rolls)
            }
            try {
                bot.createMessage(msg.channel.id,
                    ' \`\`\`' +
                    'input: ' + msg.content + '\n' +
                    'rolls: ' + rolls       + '\n' +
                    'sum of rolls: '   + m           + '\n' +
                    'sum of sum: '  + sum         + ' \`\`\` '
                );
            }
            catch (err) {
                error(err)
            }
        }
        catch (err) {
            error (err)
        }
        
        //store and display each roll and bold on max/min

        /* 
        for (let i in matches) {
            let diceRoll = matches[i]
            let diceNumbers = diceRoll.split(/d/i);
            rolls = diceNumbers[0]
            sides = diceNumbers[1]
              log("rolls :" + rolls + " sides :" + sides)
              let sum = 0;
              for (let r = 0; r < rolls; r++) {
                let randRoll = getRandomInt(1, sides)
                sum += randRoll
                log('roll ' + (1 + r) + ': ' + randRoll);
            }
            log('sum of rolls: ' + sum)
        }
        */

        /*
        let s = msg.content;
        let m = s.match(/(\d+d\d+)/i);
        log(m)
        s = s.match(/\S/ig);
        s.splice(0, m[0].length);
        s = s.join(' ');
        log(s);

        let newS = '';

        let diceNumbers = m[0].split(/d/i);
        
        let diceRolls = parseInt(diceNumbers[0]);
        let diceSides = parseInt(diceNumbers[1]);

        log(diceNumbers);
        */

        //let char_str = msg.content.match(/\S/ig)
        //log(char_str)
        //
        //for(let i in char_str) {
        //    //log(char_str[i])
        //    
        //    if (char_str[i].match(/\d/)) {
        //        //log(char_str[i])
        //    }
        //    if (char_str[i].match(/d/)) {
        //        //log(char_str[i])
        //    }
        //    if (char_str[i].match(/[-+*\/]/)) {
        //        //log(char_str[i])
        //    }
        //}
    }

    /*twitter/puppeteer     
        matches = msg.content.match(/screenshot\s+(?<url>https?:\/\/.+)/i);
 
    if (matches) {
        const url = matches.groups.url;

        await (async () => {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox'],
            });
            const page = await (await browser.createIncognitoBrowserContext()).newPage();
            await page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
            });
            await page.goto(url, {
                waitUntil: 'networkidle2',
            });
            await page.screenshot({ path: 'screenshot.png' });
            
            await browser.close();
        })();

        bot.createMessage(msg.channel.id, '', {
            file: fs.readFileSync('screenshot.png'),
            name: 'screenshot.png'
        });
    }

    matches = msg.content.match(/(?<url>https:\/\/twitter\.com\/.+status\/(?<id>[0-9]+))/i);

    let isDone = false;

    if (matches) {
        log(matches.groups.url);
        const url = matches.groups.url;
        const twitterId = matches.groups.id;

        try {
            (async () => {

                let response = await axios.get('https://api.twitter.com/1.1/statuses/show.json?id=' + twitterId + '&include_entities=true', {
                    headers: {
                        Authorization: 'Bearer ' + process.env.BEARER_TOKEN,
                    },
                });
            
                let videos = [];

                response.data.extended_entities.media.forEach((m) => {
                    let video = null;
                    if (m.video_info && m.video_info.variants) {
                        m.video_info.variants.forEach((v) => {
                            if (video === null || v.bitrate && (v.bitrate > video.bitrate) || video.bitrate === undefined && v.bitrate > 0) {
                                video = v;
                            }
                        });
                
                        if (video !== null) {
                            videos.push(video);
                        }
                    }
                });
                
                if (videos.length === 0) {
                    log(response.data);
                } 
                else {
                    log(videos);
                    for(let i in videos) {
                        log(videos[i].url);
                        bot.createMessage(msg.channel.id, videos[i].url );
                    }
                }
            })();
        } 
        catch (error) {
            error(error)
        } 
        

        async () => {
            const browser = await puppeteer.launch({
                headless: false,
                args: ['--no-sandbox'],
                devtools: true,
            });

            const page = await browser.newPage();
            await page.setViewport({
                width: 1920 / 2,
                height: 1080,
                deviceScaleFactor: 1,
            });


            page.on('con  sole', (event) => {
                log('console', event);
            });
           
            page.on('pageerror', (event) => {
                log('pageerror', event);
            });
           
            page.on('request', async (event) => {
                if (isDone) {
                    return;
                }

                const requestUrl = event.url();
                const id = matches.groups.id;
                //(?<url>https:\/\/video\.twimg\.com\/ext_tw_video\/ id \/.+)
                //let regex = new RegExp('(?<url>https:\/\/video\.twimg\.com\/ext_tw_video\/' + id + '\/.+)', 'i')

                //log(regex.exec(url));

                _matches = requestUrl.match(/(?<videoUrl>https:\/\/video\.twimg\.com\/ext_tw_video\/[0-9]+\/.+)/i);

                if (_matches && !isDone) {
                    isDone = true;
                    
                    const videoUrl = _matches.groups.videoUrl;
                    log(videoUrl);
                    log(await DownloadVideo(videoUrl));
                }

                if (isDone　== true ) {
                    log('posting message');
                    bot.createMessage(msg.channel.id, '', {
                        file: fs.readFileSync('file.mp4'),
                        name: 'file.mp4'
                    });
                }

                //log('request', url);
                //https://video.twimg.com/ext_tw_video/<ID>
            });
            //
            //page.on('requestfailed', (event) => {
            //    log('requestfailed', event);
            //});

            await page.goto('https://twitter.com/login', {
                waitUntil: 'networkidle2',
            });
            //await page.screenshot({ path: 'twitterlogin.png' });
            await page.type('input[name="session[username_or_email]"]', process.env.TWITTER_USERNAME);
            await page.type('input[name="session[password]"', process.env.TWITTER_PASSWORD);
            await page.click('form div[role=button]');

            //await page.screenshot({ path: 'twitterpostlogin.png' });

            await page.goto(url, {
                waitUntil: 'networkidle2',
            });
            
            //await page.screenshot({ path: 'twitter1.png' });

            //const getVideo = async () => {
            const viewButton = await page.$('[class="css-1dbjc4n r-1kihuf0 r-1ndi9ce"] > *');

            if (viewButton !== null) {
                await viewButton.click();
            }


                //await page.screenshot({ path: 'twitter2.png' });

                //try {
                //    //els = await page.$$('*');

                //    const videoUrl = await page.$eval('video', node => {
                //        return node.src
                //    });

                //    log(videoUrl);

                //    bot.createMessage(msg.channel.id, videoUrl);
                //} catch (error) {
                //    log('no video', error);
                //    //return false;
                //    //page.goto(_matches.groups.videoUrl);
                //    
                //}


                //await page.screenshot({ path: 'twitter3.png' });

            //await browser.close();

                //return true;
            //};

            //let result = false;
            //while(result !== true) {
            //    await getVideo();
            //}
        };
    }
    */
});

bot.connect(); // Get the bot to connect to Discord
