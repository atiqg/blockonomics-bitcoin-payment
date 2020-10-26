//WEBSOCKET VARIABLE TO LISTEN PAYMENT NOTIFICATIONS
let connection;
//VARIABLE TO STORE EXCHANGE PRICE
let btcUsdExc;


/**
 * FUNCTION TO GET A NEW/OLD BITCOIN PAYMENT ADDRESS
 * STEP 1: REQUEST ADDRESS FROM SERVER
 * STEP 2: REQUEST EXCHANGE PRICE FROM SERVER
 * STEP 3: SET CHECKOUT UI/HTML 
 */
function get_address(){
    document.querySelector('#loadingSvg').style.display = 'block';
    
    console.log("started");
    const url = "https://blockonomics-test.netlify.app/.netlify/functions/address?reset=0";
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

/**
 * FUNCTION GET ESTABLISH WEBSOCKET CONNECTION FOR PAYMENT NOTIFICATION
 * STEP 1: INITIALIZE A WEBSOCKET
 * STEP 2: ON MESSAGE CHECK STATUS OR ON ERROR PRINT ERROR
 * STEP 3: IF SUCCESSFUL REQUEST ORIGINAL ASSET DOWNLOAD LINK
 * STEP 4: CALL TRANSACTION STATUS UI/HTML
 * @param {string} address bitcoin payment address
 */
function payment_notifications(address){
    document.querySelector('#loadingSvg').style.display = 'block';

    //initialize websocket
    const url = 'wss://www.blockonomics.co/payment/'+ address;
    connection = new WebSocket(url)
    connection.onopen = () => {
        console.log('Websocket is open');
    }
    
    //on message
    connection.onmessage = (e) => {
        let message = JSON.parse(e.data);
        
        //set transaction status
        if(message.status == 0){
            message.statusMessage = 'unconfirmed ';
        }else if(message.status == 1){
            message.statusMessage = 'partially confirmed ';
        }else if(message.status == 2){
            message.statusMessage = 'confirmed ';
        }    
        
        //get original asset url
        const url = 'https://blockonomics-test.netlify.app/.netlify/functions/original_art?addr='+ address +'&status='+message.status;
        fetch(url) 
        .then(response => response.text())
        .then(contents => {
            //set transaction status UI
            set_transaction_html((message.value/100000000), message.statusMessage, message.txid, contents);
            console.log(contents);
        })
        .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))

        connection.close();
    }

    //on error
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

//GET CURRENT TIME IN UNIX FORMAT
var time = Date.now || function() {
    return +new Date;
};


/**
 * FUNCTION TO SET A TIMER FOR A CERTAIN DURATION
 * STEP 1: PARSE MINUTE AND SECONDS FROM TIMER VARIABLE
 * STEP 2: ADJUST 10base DIGIT
 * STEP 3: FORMAT TIMER
 * STEP 4: DECREASE TIME 
 * STEP 5: IF TIMER IS UP THEN CLOSE WEBSOCKET AND SHOW TIMEOUT MESSAGE
 * @param {number} duration time duration for the timer
 * @param {element} display html element to show timer
 */
function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    var myInt = setInterval(function () {
        //parse
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        //10base adjustment
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        //format
        display.textContent = minutes + ":" + seconds;

        if (--timer < 0) {
           
        }
      if(timer<0){        
        document.querySelector('.timerDiv').innerHTML = 'Finished';
        clearInterval(myInt);
        //close websocket
        if(connection){
            connection.close();
        }
        //show timeout
        set_transaction_html('Zero', 'timeout', 'timeout', '');
      }
    }, 1000);
}

/**
 * FUNCTION TO MAKE A GET REQUEST AND RETURN/EXPECT A JSON RESPONSE
 * @param {string} url address to make GET request to 
 */
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

/**
 * FUNCTION TO SET CHECKOUT UI ON MAIN HTML PAGE
 * STEP 1: STORE EXCHANGE RATE
 * STEP 2: CHANGE PRICE INTO REQUIRED PAYMENT TO BE MADE BY USER
 * STEP 3: SET CHECKOUT UI
 * STEP 4: GENERATE A QR CODE FOR BITCOIN PAYMENT ADDRESS
 * STEP 5: START TIMER FOR 10 MINUTES
 * STEP 6: TRIGGER PAYMENT NOTIFICATION RECEIVER
 * @param {string} address bitcoin payment address 
 * @param {string} price exchange price rate
 */
function set_checkout_html(address, price){
    document.querySelector('#loadingSvg').style.display = 'none';

    btcUsdExc = price;
    price = (0.20/price).toFixed(6);//0.20 USD is mentioned asset price
    
    //set UI
    document.querySelector('#paymentSection').innerHTML = '<div class="checkoutTitle">Scan QR or Use below Address to <b>Pay ' + price + ' BTC</b></div>' + 
    '<div class="btcAddress">Address: <span class="addressValue">' + address + '</span></div>' +
    '<canvas id="qrCode"></canvas>' + 
    '<div class="timerDiv"><span id="time">10:00</span> minutes</div>';

    //generate a qr code and attach it to canvas element
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

    //start timer
    startTimer(60 * 10, document.querySelector('#time'));
    //trigger notification receiver
    payment_notifications(address);
}


/**
 * FUNCTION TO SET TRANSACTION UI/HTML
 * STEP 1: CHECK IF USER PAID MORE OR LESS THAN REQUIRED AMOUNT
 * STEP 2: IF SO THEN SHOW THEM A MESSAGE REGARDING IT
 * STEP 3: SET TRANSACTION URL
 * @param {string} amount paid by user
 * @param {string} txStatus transaction status
 * @param {string} txId transaction ID
 * @param {string} artUrl original asset download link
 */
function set_transaction_html(amount, txStatus, txId, artUrl){
    document.querySelector('#loadingSvg').style.display = 'none';
    let warningText = document.querySelector('#warningText');
    
    //check if user paid more or less than required
    if(amount < (0.20/btcUsdExc)){
        warningText.style.fontSize = '22px';
        warningText.innerHTML = 'You paid Less But still here is your reward';
    }else if(amount > (0.20/btcUsdExc)){
        warningText.style.fontSize = '22px';
        warningText.innerHTML = 'Thanks, you paid extra' ;
    }

    //SET UI
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