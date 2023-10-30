const functions = require('@google-cloud/functions-framework');
var request = require('request');
const cheerio = require('cheerio');
const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    getGeekNews();
    res.send('get Hello World');
});

app.post('/', (req, res) => {
    getGeekNews();
    res.send('Post Hello World');
});

var webhook_url = "";
var geeknews_url = "https://news.hada.io/";

function getGeekNews() {
    request({ url: geeknews_url }, function cb(err, httpResponse, body) {
        if (err) {
            console.error('Geek News failed to fetch');
        } else {
            const $ = cheerio.load(body); // Load the HTML using cheerio

            const topicRows = $('.topic_row');

            topicRows.each((index, element) => {
                const topictitle = $(element).find('.topictitle');
                const topicdesc = $(element).find('.topicdesc');

                const titleLink = topictitle.find('a');
                const titleHref = titleLink.attr('href');

                if (topictitle && topicdesc) {
                    const titleText = topictitle.find('h1').text();
                    const descText = topicdesc.find('a.c99').text();

                    postLink(titleText, titleHref, descText);
                }
            });
        }
    });
}

function postLink(title, link, description) {
    var data = {
        "text": title + "\n" + description + "\n" + link
    };

    request.post(
        {
            headers: { 'Content-type': 'application/json' },
            url: webhook_url,
            form: { payload: JSON.stringify(data) }
        },
        (error, res, body) => console.log(error, body, res.statusCode)
    );
}

app.listen(port, () => {
    console.log(`Rest API started successfully on port ${port}`);
});
