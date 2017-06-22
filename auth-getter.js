// bmc: Created by Bon Crowder, June 2017
// bmc: all of my comments are marked with my initials, "bmc"
// bmc: questions? give me a call at 713-557-8048

var express = require("express");
var request = require('superagent');

var PORT = process.env.PORT || 3000;
var app = express();

var clientID = 'ef2c7856de0726a5f07a',
        clientSecret = '955b1ff3f689b6dba00f2ca5e68bdea8',
        apiUrl = 'https://api.artsy.net/api/tokens/xapp_token',
        xappToken;

request
.post(apiUrl)
.send({client_id: clientID, client_secret: clientSecret})
.end(function (err, res) {
    console.log(JSON.stringify(res));
    console.log(JSON.stringify(res.body.expires_at)); // bmc: new line
    xappToken = res.body.token;
    console.log('***********************');
    console.log(xappToken);
});

app.listen(PORT, function () {
    console.log('listening on port', PORT);
});
