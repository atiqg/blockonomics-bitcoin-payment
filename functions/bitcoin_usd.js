//MODULE TO MAKE POST REQUEST
const https = require('https');

//RESULT VARIABLE
const data = JSON.stringify({
    todo: 'Buy the milk'
});

/**
 * FUNCTION TO GET BITCOIN TO USD EXCHANGE PRICE
 * STEP: MAKE A GET REQUEST TO BLOCKONOMICS API
 */
async function test() {

  const options = {
    hostname: 'blockonomics.co',
    port: 443,
    path: '/api/price?currency=USD',
    method: 'GET',
    headers: {
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
    let result = await test();
    result = result.price;
    return {
      statusCode: 200,
      body: `${result}`,
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