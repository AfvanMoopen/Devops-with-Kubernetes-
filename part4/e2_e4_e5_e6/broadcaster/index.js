const Nats = require('nats');
const Got = require('got');

const natsHost = process.env.NATS || '';
const apiKey = process.env.APIKEY || ''

// NATS API
let nc = null;
if(natsHost) {
  console.log('Connecting to NATS: ', natsHost);
  nc = Nats.connect(natsHost);
  nc.on('connect', () => console.log('Connected to NATS'));
  nc.on('error', (err) => console.log('Failed to connect to NATS: ', err));
}

// Telegram API
let lastSeenUpdate = 1;
const readBotState = async () => {
  const url=`https://api.telegram.org/bot${apiKey}/getMe`;
  const { body } = await Got(url);
  console.log(body);
}

const sendMessage = async (chatId, msg) => {
  let chatMsg = encodeURI(msg);
  const url=`https://api.telegram.org/bot${apiKey}/sendMessage?chat_id=${chatId}&text=${chatMsg}`;
  const { body } = await Got(url);

  console.log(body);
}

const readUpdate = async () => {
  const url=`https://api.telegram.org/bot${apiKey}/getUpdates?offset=${lastSeenUpdate+1}`;
  const { body } = await Got(url);

  const data = JSON.parse(body);

  if(!data || !data.result || !Array.isArray(data.result) || data.result.length === 0) {
    return;
  }

  for(const res of data.result) {
    console.log(res);
    if( res.update_id > lastSeenUpdate) {
      lastSeenUpdate = res.update_id;
    }

  }
}

// Subscribe to NATS
if(nc) {
  nc.subscribe('todos', { queue: 'job.workers' }, (msg) => {
    if(apiKey) {
      sendMessage(118693185, `New NATS message:\n${msg}`);
    }
  });
}

// Hack to keep process alive long enough to flush output in case of error
setInterval(function() {}, 15000);