let connection;
let btcUsdExc;

function get_address(){
    document.querySelector('#loadingSvg').style.display = 'block';
    
    console.log("started");
    const url = "https://blockonomics-test.netlify.app/.netlify/functions/address?reset=1";
    fetch(url) 
    .then(response => response.text())
    .then(contents => {
        let btcToUsd = 'https://blockonomics-test.netlify.app/.netlify/functions/bitcoin_usd';
        get_request_json(btcToUsd).then(response => {
            set_checkout_html(contents, response);
            console.log(contents, response);
        });
    })
    .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))
}

function payment_notifications(address){
    document.querySelector('#loadingSvg').style.display = 'block';

    const url = 'wss://www.blockonomics.co/payment/'+ address;
    connection = new WebSocket(url)
    connection.onopen = () => {
        console.log('Websocket is open');
    }
    
    connection.onmessage = (e) => {
        let message = JSON.parse(e.data);
        if(message.status == 0){
            message.statusMessage = 'unconfirmed ';
        }else if(message.status == 1){
            message.statusMessage = 'partially confirmed ';
        }else if(message.status == 2){
            message.statusMessage = 'confirmed ';
        }    
        
        const url = "https://blockonomics-test.netlify.app/.netlify/functions/original_art";
        fetch(url) 
        .then(response => response.text())
        .then(contents => {
            set_transaction_html((message.value/100000000), message.statusMessage, message.txid, contents);
            console.log(contents);
        })
        .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))

        connection.close();
    }

    connection.onerror = (error) => {
        document.querySelector('#loadingSvg').style.display = 'none';
        console.log(`WebSocket error: ${error}`);
        connection.close();
    }

    window.onbeforeunload = function() {
        connection.close();
    };

    connection.onclose = function () {
        console.log('websocket is closed');
    };
}


var time = Date.now || function() {
    return +new Date;
};





function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    var myInt = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
           
        }
      if(timer<0){        
        document.querySelector('.timerDiv').innerHTML = 'Finished';
        clearInterval(myInt);

        if(connection){
            connection.close();
        }
        set_transaction_html('Zero', 'timeout', 'timeout', '');
      }
    }, 1000);
}

function get_request_json(url){
    return fetch(url,
    {
        method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseData) => {
      return responseData;
    })
    .catch(error => console.warn(error));
}


function set_checkout_html(address, price){
    document.querySelector('#loadingSvg').style.display = 'none';

    btcUsdExc = price;
    price = (0.20/price).toFixed(6);
    
    document.querySelector('#paymentSection').innerHTML = '<div class="checkoutTitle">Scan QR or Use below Address to <b>Pay ' + price + ' BTC</b></div>' + 
    '<div class="btcAddress">Address: <span class="addressValue">' + address + '</span></div>' +
    '<canvas id="qrCode"></canvas>' + 
    '<div class="timerDiv"><span id="time">10:00</span> minutes</div>';

    var qr;
    (function() {
        qr = new QRious({
            element: document.getElementById('qrCode'),
            size: 250,
            background: '#f0eee5',
            foreground: '#673C45',
            value: 'bitcoin:' + address
        });
    })();

    startTimer(60 * 10, document.querySelector('#time'));
    
    payment_notifications(address);
}

function set_transaction_html(amount, txStatus, txId, artUrl){
    document.querySelector('#loadingSvg').style.display = 'none';
    let warningText = document.querySelector('#warningText');
    
    if(amount < (0.20/btcUsdExc)){
        warningText.style.fontSize = '22px';
        warningText.innerHTML = 'You paid Less But still here is your reward';
    }else if(amount > (0.20/btcUsdExc)){
        warningText.style.fontSize = '22px';
        warningText.innerHTML = 'Thanks, you paid extra' ;
    }

    document.querySelector('#paymentSection').innerHTML = '<div class="transactionTitle">Transaction Status</div>' +
    '<div class="transactionAmount">Payment amount: <span class="txResponse">' + amount + ' BTC</span></div>' + 
    '<div class="transactionStatus">Transaction Status: <span class="txResponse">' + txStatus + '</span></div>' + 
    '<div class="transactionId">Transaction ID: <span class="txIdValue">' + txId + '</span></div>' +
    '<div class="highRes" onclick=\'window.open("' + artUrl + '")\' >Download Original Art</div>';
}


/**
 * delay execution of statement for some milliseconds
 * @param {number} milliseconds 
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}