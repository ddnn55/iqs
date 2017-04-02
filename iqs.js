#!/usr/bin/env node

const superagent = require('superagent'),
      argv = require('yargs').argv,
      cheerio = require('cheerio');

const url = argv._[0],
      selector = argv._.slice(1).join(' ');

superagent.get(url).end(function(err, response) {
	if(err) {
		console.err('GET ' + url + ' responded with ' + response.status + ' ('+response.statusType+')');
	}

	const $ = cheerio.load(response.text);
	
	console.log($(selector).html());
});

