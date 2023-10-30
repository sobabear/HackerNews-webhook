const functions = require('@google-cloud/functions-framework');
var request = require('request');
var DOMParser = require('dom-parser');
const express = require('express');

const parser = new DOMParser();


const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    getGeekNews();
    res.send(`get Hello World'}!`);
});

app.post('/', (req, res) => {
    getGeekNews();
    res.send(`Post Hello World'}!`);
});

var webhook_url = "https://~~~";
var geeknews_url = "https://news.hada.io/";


function getGeekNews() {
    request(
        { url: geeknews_url },
        function cb(err, httpResponse, body) {
            if (err) {
                console.error('Geek News failed to fetch');
            } else {
                const htmlDoc = parser.parseFromString(body, 'text/html');
                const topicRows = htmlDoc.querySelectorAll('.topic_row');

                topicRows.forEach((topicRow) => {
                    const topictitle = topicRow.querySelector('.topictitle');
                    const topicdesc = topicRow.querySelector('.topicdesc');

                    const titleLink = topictitle.querySelector('a');
                    const titleHref = titleLink.getAttribute('href');
                  
                    if (topictitle && topicdesc) {
                      const titleText = topictitle.querySelector('h1').textContent;
                      const descText = topicdesc.querySelector('a.c99').textContent;

                      postLink(titleText, titleHref, descText);
                  
                    }
                  });

            }
        }
    );
}

function postLink(title, link, description) {
    var data =  {
        "text": title + "\n" + description + "\n" + link
    };

    request.post(
        {
          headers : { 'Content-type' : 'application/json' },
          url: webhook_url,
          form : {payload: JSON.stringify(data )}
        },
        (error, res, body) => console.log(error, body, res.statusCode)
      );
}

app.listen(port, () => {
    console.log(`Rest API started successfully on port ${port}`);
});

// functions.http('getGeekNews', (req, res) => {
//   getGeekNews();
//   res.send(`Hello World!`);
// });