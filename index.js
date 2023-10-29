const functions = require('@google-cloud/functions-framework');
var request = require('request');

const express = require('express');
const app = express();

const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    console.log(`wow`);
    selectAndPost();
    res.send(`get Hello World'}!`);
});

app.post('/', (req, res) => {
    console.log(`wow2`);
    selectAndPost();
    res.send(`Post Hello World'}!`);
});




var CONFIG = {
    "webhook_url": "https://hooks.slack.com/services/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",
    "channel": "#general",
    "bot_username": "HackerNewsBot",
    "bot_icon_emoji": ":newspaper:",
    "post_color": "#FF6600",
    "fallback": "Newsbot: Your automated news aggregator."
};

// selectAndPost();

function selectAndPost() {
    // Choose a random URL pool from HN, with greater probability of selecting top stories. 
    var api_url = ["https://hacker-news.firebaseio.com/v0/topstories.json", "https://hacker-news.firebaseio.com/v0/newstories.json", "https://hacker-news.firebaseio.com/v0/showstories.json", "https://hacker-news.firebaseio.com/v0/topstories.json"];
    var api_url = api_url[Math.floor(Math.random() * api_url.length)];

    request({
        url: api_url
    }, function cb(err, httpResponse, body) {

        if (err) {
            console.error("Newsbot failed to fetch " + api_url + "!");
            // Retry if set in config. 
            if (CONFIG.retry) {
                selectAndPost();
            }
        } else {
            console.log('5252');
            body = JSON.parse(body);
            var linkID = body[Math.floor(Math.random() * body.length)];
            var url = "https://hacker-news.firebaseio.com/v0/item/" + linkID + ".json";

            request(url, function optionalCallback(err, httpResponse, body) {
                if (err) {
                    console.error("Hacker News Scraper failed to fetch " + url + "!");
                } else {
                    body = JSON.parse(body);
                    postLink(body.title, body.url, body.score, body.by);
                }
            });
        }
    });
}

function postLink(title, link, score, author) {

    // // Construct the call to the Slack webhoook using the scraped link and configuration options.
    // var data = {
    //     "channel": CONFIG.channel,
    //     "username": CONFIG.bot_username,
    //     "icon_emoji": CONFIG.bot_icon_emoji,
    //     "attachments": [{
    //         "title": title,
    //         "title_link": link,
    //         "fallback": CONFIG.fallback,
    //         "color": CONFIG.post_color,
    //         "fields": [{
    //             "title": "Author",
    //             "value": author,
    //             "short": true
    //         }, {
    //             "title": "Score",
    //             "value": score,
    //             "short": true
    //         }]
    //     }]
    // };
    var data = {
        "text": title
    };

    var options = {
        url: CONFIG.webhook_url,
        body: JSON.stringify(data),
        json: true,
        method: "post"
    };

    console.log(title);

    request.post(
        {
          headers : { 'Content-type' : 'application/json' },
          url: CONFIG.webhook_url,
          form : {payload: JSON.stringify(data )}
        },
        (error, res, body) => console.log(error, body, res.statusCode)
      );
}

app.listen(port, () => {
    console.log(`Rest API started successfully on port ${port}`);
});

functions.http('selectAndPost', (req, res) => {
  res.send(`Hello ${req.query.name || req.body.name || 'World'}!`);
});
