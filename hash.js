const bcrypt = require('bcrypt');

const password = '20040714';

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('Hashed password:', hash);
  })
  .catch(err => console.error(err));
