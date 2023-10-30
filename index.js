const functions = require('@google-cloud/functions-framework');
var request = require('request');

const express = require('express');
const app = express();

const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    selectAndPost();
    res.send(`get Hello World'}!`);
});

app.post('/', (req, res) => {
    selectAndPost();
    res.send(`Post Hello World'}!`);
});

var webhook_url = "";

var CONFIG = {
    "webhook_url": webhook_url,
    "channel": "#general",
    "bot_username": "HackerNewsBot",
    "bot_icon_emoji": ":newspaper:",
    "post_color": "#FF6600",
    "fallback": "Newsbot: Your automated news aggregator."
};

// selectAndPost();
// var api_url = ["https://hacker-news.firebaseio.com/v0/topstories.json", "https://hacker-news.firebaseio.com/v0/newstories.json", "https://hacker-news.firebaseio.com/v0/showstories.json", "https://hacker-news.firebaseio.com/v0/topstories.json"];
var topStories = "https://hacker-news.firebaseio.com/v0/topstories.json";
// var newStories = "https://hacker-news.firebaseio.com/v0/newstories.json";
// var showStories = "https://hacker-news.firebaseio.com/v0/showstories.json";

function selectAndPost() {
    request({
        url: topStories
    }, function cb(err, httpResponse, body) {
        if (err) {
            console.error("Newsbot failed to fetch " + topStories + "!");
            if (CONFIG.retry) {
                selectAndPost();
            }
        } else {
            body = JSON.parse(body);
            var index;
            for (index = 0; index < 10; index++) {
                var linkID = body[index];
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
        }
    });
}

function postLink(title, link, score, author) {
    var data = {
        "text": title
    };

    var options = {
        url: CONFIG.webhook_url,
        body: JSON.stringify(data),
        json: true,
        method: "post"
    };


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

// functions.http('selectAndPost', (req, res) => {
//   selectAndPost();
//   res.send(`Hello World!`);
// });
