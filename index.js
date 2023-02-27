import { XMLParser} from 'fast-xml-parser';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { execSync } from 'node:child_process'
import fetch from 'node-fetch';
import * as fs from 'fs';
import { parse } from 'json2csv';

const argv = yargs(hideBin(process.argv)).argv

async function checker(){
  
  if(!argv.url){
    console.log('url is required');
    return false;
  }
  
  const seo = argv.seo ? argv.seo : 0.8;
  const speed = argv.speed ? argv.speed : 0.8;
  const access = argv.access ? argv.access : 0.8;
  const limit = argv.limit ? argv.limit : null;
  const parser = new XMLParser();
  const url = argv.url;
  const response = await fetch(url);
  const xml = await response.text();
  let urlsXml = parser.parse(xml);
  let urlsList = []
  if(limit){
    urlsList = urlsXml.urlset.url.map(item => item.loc).slice(1,limit);  
  }else{
    urlsList = urlsXml.urlset.url.map(item => item.loc)
  }
  try {
      execSync(`lighthouse-batch -s ${urlsList}`); // Executes this on the command line to run the performance test
      console.log('done summary');

      let rawdata = fs.readFileSync('./report/lighthouse/summary.json');
      let summary = JSON.parse(rawdata);
      const summaryFilter = summary.filter(item => item.detail.performance < speed || item.detail.performance < seo || item.detail.accessibility < access);

      const mapSummaryFilter = summaryFilter.map(item => {
        return {url: item.url, seo: item.detail.seo, speed: item.detail.performance, accessibility: item.detail.accessibility}
      });

      const csvData = mapSummaryFilter.length > 0 ? parse(mapSummaryFilter) : 'No errors';
      fs.writeFileSync('results.csv', csvData);
      console.log('all set');
  }
  catch(err) {
    console.log(err)
      console.log(`Performance test failed`); // If Lighthouse happens to fail it'll log this to the console and log the error message
    return
  }
}

checker();

  


