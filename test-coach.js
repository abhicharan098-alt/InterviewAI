require('ts-node').register({ transpileOnly: true });
const { PersonalCoachService } = require('./src/lib/ai/PersonalCoachService');

async function test() {
  try {
    const data = await PersonalCoachService.getCoachingData("e442ed9b-f169-456d-8023-d8487fcd72b5");
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("SERVICE CRASHED:", e);
    console.error(e.stack);
  } finally {
    process.exit(0);
  }
}

test();
