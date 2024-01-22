const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs')
const scrapeAmazonSmartphones = async () => {
    try {
        const response = await axios.get('https://www.amazon.com/s?k=smart+phhone&crid=2V7AU166BNH1G&sprefix=smart+phhone%2Caps%2C384&ref=nb_sb_noss_2', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
    });
        const html = response.data;
        const $ = cheerio.load(html);
        
        console.log($)
        const smartphones = [];
        const platform = 'amazon'
        $('div.s-result-item').each((_idx, el) => {
            const smartphone = $(el);
            const title = smartphone.find('span.a-text-normal').text().trim();
            const price = smartphone.find('span.a-price .a-offscreen').text();
            const stars = smartphone.find('i.a-icon-star-small > span.a-icon-alt').text();
            const reviews = smartphone.find('span.a-size-base').text();
            const link = smartphone.find('a.a-link-normal.a-text-normal').attr('href');

            if (title && price) {
                smartphones.push({ title, price, stars, reviews, link: `https://www.amazon.com${link}`, platform});
            }
        });

        console.log(smartphones);
        fs.writeFile('amazon_mobiles.json',JSON.stringify(smartphones),(err)=>{
            if(err) throw err;
            console.log('File saved')
        })
    } catch (error) {
        console.error("Error:", error);
    }
};

scrapeAmazonSmartphones();
