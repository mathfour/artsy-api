var express = require("express");
var path = require("path");
var fs = require('fs');
var axios = require('axios');
var colors = require("colors");
var request = require('request');
const cheerio = require('cheerio');

var PORT = process.env.PORT || 3000;
var app = express();
var instance = axios.create({
    baseURL: 'https://api.artsy.net/api',
    headers: {
        'X-XAPP-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTQ5ODU4OTA1MCwiaWF0IjoxNDk3OTg0MjUwLCJhdWQiOiI1OTQyZTFiNDhiM2I4MTA5ZmJmODZjMjQiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNTk0OTZjZmExMzliMjE2ZDYwZTBkNTAxIn0.yk2krkVaoBsXT5c7TVA28bR-Vy-N_JQw2uBYmXVTr3I',
        'Accept': 'application/vnd.artsy-v2+json'
    }
});

// bmc: put this inside the loop where I pull all that individual info
// bmc: then put the slug in place of blinn-jacobs
// bmc: then add pleaseLetThisWork value to the end of the csv list of stuff
// bmc: also, add "followers" to the list where I create the initial file


request('https://www.artsy.net/artist/blinn-jacobs', function(err, resp, html) {
    if (!err){

        console.log('this works'.rainbow);

        var $ = cheerio.load(html);
        var pleaseLetThisWork = $('.artist-header-follow-count').data('count');
        console.log(pleaseLetThisWork);
    }
});