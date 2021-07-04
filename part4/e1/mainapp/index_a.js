const fs = require('fs');

const writeStamp = () => {
  const date = new Date();
  const timestamp = date.toISOString();

  fs.writeFile('/shared/timestamp.txt', timestamp, () => {});
};

setInterval( () => {
  writeStamp();
}, 5000);

writeStamp();