import { XMLParser} from 'fast-xml-parser';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { execSync } from 'node:child_process'
import fetch from 'node-fetch';

const argv = yargs(hideBin(process.argv)).argv

async function checker(){
  
  if(!argv.url){
    console.log('url is required')
    return false
  }
  
  const parser = new XMLParser();
  const url = argv.url
  const response = await fetch(url)
  const xml = await response.text()
  let urlsXml = parser.parse(xml);
  const urlsList = urlsXml.urlset.url.map(item => item.loc).slice(1,3);  
  try {
      execSync(`lighthouse-batch -s ${urlsList}`); // Executes this on the command line to run the performance test
      console.log('done')
  }
  catch(err) {
    console.log(err)
      console.log(`Performance test failed`); // If Lighthouse happens to fail it'll log this to the console and log the error message
    return
  }
}

checker();

  


