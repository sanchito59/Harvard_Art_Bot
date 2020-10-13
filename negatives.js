const Twitter = require('twitter');
const axios = require('axios');
const fs = require('fs');
const request = require('request');

const config = {
  consumer_key: process.env.NEGATIVES_CONSUMER_KEY,
  consumer_secret: process.env.NEGATIVES_CONSUMER_SECRET,
  access_token_key: process.env.NEGATIVES_ACCESS_TOKEN,
  access_token_secret: process.env.NEGATIVES_ACCESS_TOKEN_SECRET
};

const NegativeBot = new Twitter(config);
let caption; // TODO

const getAndTweetRandomImage = async () => {
  axios.get('https://api.harvardartmuseums.org/object', {
    params: {
      hasimage: 1,
      apikey: process.env.HARVARD_API_KEY,
      keyword: 'photo'
    }
  }).then((response) => {
    return response.data.info.pages;
  }).then((pageCount) => {
    axios.get('https://api.harvardartmuseums.org/object', {
      params: {
        hasimage: 1,
        apikey: process.env.HARVARD_API_KEY,
        keyword: 'photo',
        page: Math.floor(Math.random() * pageCount),
      }
    }).then((response) => {
      const item = response.data.records[Math.floor(Math.random() * 10)]; // 10 records per page
      const objectNum = item.objectnumber;
      const photo = item.primaryimageurl;
      const artist = item.people ? item.people[0].displayname : '';
      const technique = item.technique || '';
      const dated = item.dated || '';
      const title = item.title || '';
      caption = `${title} - (${dated}) ${artist} | ${technique} | ${objectNum}`;
      if (photo === null) { // TODO
        console.log('photo url was null');
        getAndTweetRandomImage()
      }
      return new Promise((resolve, reject) => {
        download(photo, 'image.png', () => resolve(caption));
      })
    }).then(() => {
      let data = fs.readFileSync(`${__dirname}/image.png`);
      return NegativeBot.post('media/upload', { media: data });
    }).then(media => {
      console.log('media uploaded');
      const status = {
        status: caption.substring(0, 280), // Max character for a Tweet is 280
        media_ids: media.media_id_string // Need a unique mediaID from the upload
      }
      return NegativeBot.post('statuses/update', status)
    }).then(tweet => {
      console.log(tweet);
    }).catch((error) => {
      console.log(error);
    });
  });
}

const download = (uri, filename, callback) => {
  request.head(uri, (err, res, body) => {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

getAndTweetRandomImage()
