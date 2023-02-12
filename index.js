import { XMLParser} from 'fast-xml-parser';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import { spawn } from 'node:child_process';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv)).argv

async function checker(){
  
  if(!argv.url){
    console.log('url is required')
    return false
  }
  let results = [];
  
  const parser = new XMLParser();
  const url = argv.url

  const response = await fetch(url)
  const xml = await response.text()
  let urlsXml = parser.parse(xml);
  const urlsList = urlsXml.urlset.url.map(item => item.loc).slice(1,2);

  const result = urlsList.map(async url => {
    let chrome = await chromeLauncher.launch({'--headless': true});
    const options = {output: 'html', onlyCategories: ['performance'], port: chrome.port};
    const runnerResult = await lighthouse(url, options);
    // console.log('Report is done for', runnerResult.lhr.finalDisplayedUrl);
    // console.log('Performance score was', runnerResult.lhr.categories.performance.score * 100);
    results.push({url, score: runnerResult.lhr.categories.performance.score})
    await chrome.kill();
  })

  const resultTest = await Promise.all(result)
  console.log(results)
  
  // try {
  //     execSync(`lighthouse-batch -s ${urlsList} `); // Executes this on the command line to run the performance test
  // }
  // catch(err) {
  //   console.log(err)
  //     console.log(`Performance test ${runs + 1} failed`); // If Lighthouse happens to fail it'll log this to the console and log the error message
  //   return
  // }
  await console.log(`All finished`);

}

checker();

  


