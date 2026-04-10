const bcrypt = require('bcrypt');
async function test() {
  try {
    const hash = await bcrypt.hash('test', 10);
    const match = await bcrypt.compare('test', hash);
    console.log('Bcrypt working:', match);
  } catch (err) {
    console.error('Bcrypt error:', err);
  }
}
test();
