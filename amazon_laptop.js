const axios = require("axios");
const cheerio = require("cheerio");
const fs = require('fs');

const url = "https://www.amazon.in/s?k=laptop&crid=3P8SWSBOR2F5C&sprefix=lap%2Caps%2C211&ref=nb_sb_ss_ts-doa-p_2_3"
const lap_data = []

async function getLaptops(url)
{
    try{
        const response = await axios.getAdapter(url);
        const $ = cheerio.load(response.data);

        
    }
    
    catch(err)
    {

    }
}