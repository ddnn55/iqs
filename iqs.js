#!/usr/bin/env node

const superagent = require('superagent'),
      argv = require('yargs').argv,
      cheerio = require('cheerio'),
      util = require('util'),
      _ = require('lodash');

const url = argv._[0],
      rowsSelector = argv._[1],
      columnsExtractorArgs = argv._.slice(2);

let extractors = [];
let nextArg = 0;
while(nextArg < columnsExtractorArgs.length) {
	let extractor = {
		selector: columnsExtractorArgs [nextArg++]
	};
	// '@' for attribute is like XPath
	if(nextArg < columnsExtractorArgs.length && columnsExtractorArgs[nextArg].substring(0, 1) === '@') {
		extractor.attribute = columnsExtractorArgs[nextArg++].substring(1);
	}
	extractors.push(extractor);
}


const formatRow = argv.format ?
	function(columns) {
		return util.format.apply(util.format, [argv.format].concat(columns));
	} :
	function(columns) {
		return JSON.stringify(columns);
	};

superagent.get(url).end(function(err, response) {
	if(err) {
		console.err('GET ' + url + ' responded with ' + response.status + ' ('+response.statusType+')');
	}

	const $ = cheerio.load(response.text);
	
	const rowElements = $(rowsSelector);

	$(rowsSelector).each(function(rowIndex, rowElement) {
		const cells = extractors.map(function(extractor, extractorIndex) {
			const columnElement = $(rowElement).find(extractor.selector);
			//rows[elementIndex] = rows[elementIndex] || [];
			if(extractor.attribute) {
				return columnElement.attr(extractor.attribute);
			}
			else {
				return $.html(columnElement);
			}
		});
		
		console.log(formatRow(cells));
	});
	

	//rows.forEach(function(row) {
	//	console.log(util.format.apply(util.format, [format].concat(row)));
	//});
});

