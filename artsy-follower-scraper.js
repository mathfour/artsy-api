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
        'X-XAPP-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6IiIsImV4cCI6MTUwMDMxNDI1OSwiaWF0IjoxNDk5NzA5NDU5LCJhdWQiOiI1OTQyZTFiNDhiM2I4MTA5ZmJmODZjMjQiLCJpc3MiOiJHcmF2aXR5IiwianRpIjoiNTk2M2MwMTNhMDlhNjcwZmMzNTg5ODU0In0.q8jqLwKEur86K28fCQO-5HSjd4v8iB5SkWpWR4FqBXU',
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