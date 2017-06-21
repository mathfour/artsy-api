/**
 * Created by SilverDash on 6/15/17.
 */
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


// var urlFocus = 'https://api.artsy.net/api/tokens/xapp_token';
//
// var traverson = require('traverson'),
//         JsonHalAdapter = require('traverson-hal'),
//         xappToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTQ5Nzk1OTQyMiwiaWF0IjoxNDk3MzU0NjIyLCJhdWQiOiI1OTNlZTUyYmNiNGMyNzRkNjQwOTQyNTIiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNTkzZmQxN2U5YzE4ZGIxMjE3NDE1NjU2In0.Z6E0255xmpEef-HvTl2awaQ0eObEPPIPT71A3IpXsq8';
//
// traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);
// api = traverson.from('https://api.artsy.net/api').jsonHal();
//
//
// api.newRequest()
// .follow(followKey)
// .withRequestOptions({
//     headers: {
//         'X-Xapp-Token': xappToken,
//         'Accept': 'application/vnd.artsy-v2+json'
//     }
// })
// .withTemplateParameters(params)
// .getResource(function (error, result) {
//     if (error) {
//         throw error;
//     }
//
//     fs.appendFile(saveFile, result, function (err) {
//         if (err) {
//             throw err;
//         }
//         console.log(result);
//         var sN = getRandomIntInclusive(1000, 10000);
//         console.log("result updated", sN);
//     });
// });
// var clientID = '466a62ec678d51b2d527';
// var clientSecret = '58ed4fe0d2e78bfaab9dc30665e193a7';
// var apiUrl = 'https://api.artsy.net/api/tokens/xapp_token';
// Initiate the listener
app.listen(PORT, function () {
    console.log('listening on port', PORT);
});
