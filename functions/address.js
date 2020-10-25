//MODULE TO MAKE POST REQUEST
const https = require('https');
//BLOCKONOMICS API KEY
const api_key = process.env.API_KEY;

//RESULT VARIABLE
const data = JSON.stringify({
    todo: 'Buy the milk'
});

/**
 * FUNCTION TO GET NEW/OLD BITCOIN PAYMENT ADDRESS
 * STEP: MAKE A GET REQUEST TO BLOCKONOMICS API
 * @param {number} reset variable to get previous address again 
 */
async function test(reset) {
  let path;
  
  if(reset==1){
    path = '/api/new_address?reset=1';
  }else{
    path = '/api/new_address';
  }

  const options = {
    hostname: 'blockonomics.co',
    port: 443,
    path: path,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + api_key,
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'blockonomics-test.netlify.app',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
    }
  }

  return await doRequest(options, data);
}
  
//END POINT FUNCTION
exports.handler = async event => {

    const reset = event.queryStringParameters.reset;

    let subject = await test(reset);
    subject = subject.address;
    return {
      statusCode: 200,
      body: `${subject}`,
    }
}

/**
 * Do a request with options provided.
 *
 * @param {Object} options
 * @param {Object} data
 * @return {Promise} a promise of request
 */
function doRequest(options, data) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        res.setEncoding('utf8');
        let responseBody = '';
  
        res.on('data', (chunk) => {
          responseBody += chunk;
        });
  
        res.on('end', () => {
          resolve(JSON.parse(responseBody));
        });
      });
  
      req.on('error', (err) => {
        reject(err);
      });
  
      req.write(data)
      req.end();
    });
}