  

exports.handler = async event => {
    const addr = event.queryStringParameters.addr;
    let result;
    
    (addr!='') ? result='https://drive.google.com/file/d/1P_wDmGsC99CSU35FfAyfoHAtZxNJCtdS/view?usp=sharing' : result='false';

    return {
      statusCode: 200,
      body: `${result}`,
    }
}