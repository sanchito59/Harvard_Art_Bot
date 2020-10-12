const Twitter = require('twitter');
const axios = require('axios');
const fs = require('fs');
const request = require('request');
const config = {

  consumer_key: process.env.NEGATIVES_CONSUMER_KEY,
  consumer_secret: process.env.NEGATIVES_CONSUMER_SECRET,
  access_token: process.env.NEGATIVES_ACCESS_TOKEN,
  access_token_secret: process.env.NEGATIVES_ACCESS_TOKEN_SECRET

};

console.log('WILL I APPEAR?')

const NegativeBot = new Twitter(config);
let caption; // TODO

const pageCount = async () => {
  axios.get('https://api.harvardartmuseums.org/object', {
    params: {
      hasimage: 1,
      apikey: 'ec639644-84b3-4fc5-8396-aff967cbee6f',
      keyword: 'photo'
    }
  }).then((response) => {
    console.log('page count: ', response.data.info.pages)
    return response.data.info.pages;
  }).catch((error) => {
    console.log(error)
  });
};

axios.get('https://api.harvardartmuseums.org/object', {
  params: {
    hasimage: 1,
    apikey: 'ec639644-84b3-4fc5-8396-aff967cbee6f',
    keyword: 'photo',
    page: Math.floor(Math.random() * 400) // TODO: Return pageCount
  }
})
  .then((response) => {
    let randomItemOnPage = Math.floor(Math.random() * 10);
    let item = response.data.records[randomItemOnPage];
    let photo = item.primaryimageurl;
    let artist = item.people ? item.people[0].displayname : '';
    let technique = item.technique || '';
    let dated = item.dated || '';
    let title = item.title || '';
    caption = `${title} - (${dated}) ${artist} | ${technique}`;
    return new Promise((resolve, reject) => {
      download(photo, 'file.png', () => resolve(caption))
    })
  }).then(() => {
    let data = fs.readFileSync(`${__dirname}/file.png`);
    return NegativeBot.post('media/upload', { media: data });
  }).then(media => {
    console.log('media uploaded');
    const status = {
      status: caption,
      media_ids: media.media_id_string // Need a unique mediaID
    }
    return NegativeBot.post('statuses/update', status)
  }).then(tweet => {
    console.log(tweet);
  }).catch(function (error) {
    console.log(error);
  });

const download = (uri, filename, callback) => {
  request.head(uri, function (err, res, body) {
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
