const TwitterBot = require('node-twitterbot').TwitterBot;

const NegativeBot = new TwitterBot({
  consumer_key: process.env.NEGATIVES_CONSUMER_KEY,
  consumer_secret: process.env.NEGATIVES_CONSUMER_SECRET,
  access_token: process.env.NEGATIVES_ACCESS_TOKEN,
  access_token_secret: process.env.NEGATIVES_ACCESS_TOKEN_SECRET
});

NegativeBot.tweet('up and running');
