const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');
const json2csv = require('json2csv').parse;
const type = 'TV';

let flipkart_laps = [];
let pages = 0;
const scrapeLaptopData = async (url) => {
    try {
        const baseurl = 'https://www.flipkart.com';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
            }
        });

        const html = response.data;
        const $ = cheerio.load(html);
        const products = $('div._2kHMtA'); // Adjust selector based on Flipkart's HTML structure
        platform = 'Flipkart';

        
        products.each((index, product) => {
            

          

                let arrayEle=$(product).find('.rgWa7D')
                let description=''
                for(let i=0;i<arrayEle.length;i++){
                    description+=$(arrayEle[i]).text()
                    // if(i!=arrayEle.length){
                    //     description+'\n'
                    // }
                    
                }
                console.log(description)
                // console.log("content is "+$(product).find("._1xgFaf").text())
                // console.log($(product).text())
                console.log('**************************************************************************************************************************************************************')
                
            
                const tit = $(product).find('div._4rR01T').text();
                const b = tit.split(' ');
                const words = tit.split(' ').slice(0, 4);
                // Join the first 4 words to form title2
                const title = words.join(' ');
            const brand = b[0];
            const product_link = $(product).find('._1fQZEK').attr('href');
            const remainingWords = b.slice(1).join(' ');
            description=description+remainingWords;
            // const description= $('ul._1xgFaf li').map((index, element) => $(element).text()).get().join(' ');;
            const price = $(product).find('div._1_WHN1').text(); // Assuming rating is available
            const image = $(product).find('._396cs4').attr('src');
            let element = {
                title,
                image,
                price,
                description,
                brand,
                platform,
                type,
                product_link,
            };

            // Push the element to the flipkart_laps array
            flipkart_laps.push(element);
        });

        if ($('._1LKTO3').length > 0 && pages<82) {
            const next_page = baseurl + $("._1LKTO3").attr("href");
            pages++;
            return scrapeLaptopData(next_page); // Return the promise
        }

        return flipkart_laps; // Resolve the promise with the collected data
    } catch (err) {
        console.log(err);
        throw err; // Reject the promise if there's an error
    }
}

const startUrl = 'https://www.flipkart.com/search?q=tv&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off';

// Call the function and wait for the data to be collected
scrapeLaptopData(startUrl)
    .then((data) => {
        console.log(data.length);
        const fields = ['title','image','price','description','brand', 'platform', 'type','product_link'];
        const csv = json2csv(data, { fields });

        fs.writeFile('flip_Tv.csv', csv, (err) => {
            if (err) throw err;
            console.log("CSV file is saved");
        });
    })
    .catch((err) => {
        console.error(err);
    });