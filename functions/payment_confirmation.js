  

exports.handler = async event => {
    const status = event.queryStringParameters.status;
    const addr = event.queryStringParameters.addr;
    const value = event.queryStringParameters.value;
    const txid = event.queryStringParameters.txid; 

    let result='';

    if(status == 0){
        result += 'Payment: Unconfirmed ';
    }else if(status == 1){
        result += 'Payment: Partially Confirmed ';
    }else if(status == 2){
        result += 'Payment: Confirmed ';
    }

    result += 'by ' + addr + ' ';
    result += 'of ' + (value/100000000) + ' BTC ';
    result += 'with txID ' + txid;
    
    console.log(result);

    return {
      statusCode: 200,
      body: `${result}`,
    }
}