  
//END POINT FUNCTION
exports.handler = async event => {
    //get address parameter
    const addr = event.queryStringParameters.addr;
    const payment_status =  event.queryStringParameters.status;

    let result;
    //if address and payment status is supplied then send original asset url
    if(addr != '' && (payment_status == 0 || payment_status == 1 || payment_status == 2)){
      result='https://drive.google.com/file/d/1P_wDmGsC99CSU35FfAyfoHAtZxNJCtdS/view?usp=sharing';
    }else{
      result = '';
    }

    return {
      statusCode: 200,
      body: `${result}`,
    }
}