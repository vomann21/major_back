const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const json2csv = require('json2csv').parse;
const type = 'Watches'; // Change the type if necessary

let flipkart_watches = [];
let pages = 0;

const scrapeWatchData = async (url) => {
    try {
        const baseurl = 'https://www.flipkart.com';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = $('div._1AtVbE'); // Adjust selector based on Flipkart's HTML structure

        products.each((index, product) => {
            const brand = $(product).find('div._2WkVRV').text().trim();
            const description = $(product).find('div.IRpwTa._2-ICcC').text().trim();
            const price = $(product).find('div._30jeq3').text().trim();
            const image = $(product).find('div._2r_T1I img').attr('src');
            const product_link = baseurl + $(product).find('a._2UzuFa').attr('href');
            const element = {
                brand,
                description,
                price,
                image,
                platform: 'Flipkart',
                type,
                product_link,
            };
            flipkart_watches.push(element);
        });

        if ($('a._1LKTO3').length > 0 && pages < 150) {
            const next_page = baseurl + $('a._1LKTO3').attr('href');
            pages++;
            return scrapeWatchData(next_page); // Return the promise
        }

        return flipkart_watches; // Resolve the promise with the collected data
    } catch (err) {
        console.log(err);
        throw err; // Reject the promise if there's an error
    }
}

const startUrl = 'https://www.flipkart.com/search?q=watch%20for%20men&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off';

// Call the function and wait for the data to be collected
scrapeWatchData(startUrl)
    .then((data) => {
        console.log(data.length);
        const fields = ['brand', 'description', 'price', 'image', 'platform', 'type', 'product_link'];
        const csv = json2csv(data, { fields });

        fs.writeFile('flipkart_watches.csv', csv, (err) => {
            if (err) throw err;
            console.log("CSV file is saved");
        });
    })
    .catch((err) => {
        console.error(err);
    });
