  
//END POINT FUNCTION
exports.handler = async event => {
    //get address parameter
    const addr = event.queryStringParameters.addr;
    let result;
    //if address is supplied then send original asset url
    (addr!='') ? result='https://drive.google.com/file/d/1P_wDmGsC99CSU35FfAyfoHAtZxNJCtdS/view?usp=sharing' : result='false';

    return {
      statusCode: 200,
      body: `${result}`,
    }
}