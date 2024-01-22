const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs')
const fetchShelves = async () => {
   try {
    const response = await axios.get('https://www.amazon.com/s?k=laptops&crid=NB0WMDKFZGVR&sprefix=lapto%2Caps%2C460&ref=nb_sb_noss_2', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
    });
    

       const html = response.data;

       const $ = cheerio.load(html);

       const shelves = [];
    //    console.log($)
  const platform = 'Amazon'
 $('div.sg-col-20-of-24.s-result-item.s-asin').each((_idx, el) => {
        // console.log("el is ", el)   
           const shelf = $(el)
        //    const title = shelf.find('span.a-text-normal').text()
        //    const title = shelf.find('span.a-size-base-plus.a-color-base.a-text-normal').text()
           const image = shelf.find('img.s-image').attr('src')
           const title =shelf.find('span.a-text-normal').text().trim();
           const price =shelf.find('span.a-price .a-offscreen').text();
           const stars =shelf.find('i.a-icon-star-small > span.a-icon-alt').text();
           const reviews =shelf.find('span.a-size-base').text();
           const link =shelf.find('a.a-link-normal.a-text-normal').attr('href');
           
           let element = {
            title,
            price,
            stars,
            reviews,
            link: `https://amazon.com${link}`,
            platform
        }
        shelves.push(element)
           

       });
//     //    return shelves;
    // console.log(shelves)
    fs.appendFile('amazon_shelves.json', JSON.stringify(shelves), (err) => {
        if (err) throw err;
        console.log('Data appended to file');
    });
   } catch (error) {
       throw error;
   }
};

fetchShelves()
// .then((shelves) => console.log(shelves));