const fs = require('fs');
const path = require('path');
const { createQuote } = require('../src/utils/quoteGenerator');

async function main() {
  const buffer = await createQuote({
    avatarURL:
      'https://cdn.discordapp.com/avatars/393803995065614343/650cadb0a3df4abb6117294aeae0db47.png?size=512',
    quote: 'testtext',
    author: 'testname',
  });

  const outputPath = path.join(__dirname, 'quote-test.png');
  fs.writeFileSync(outputPath, buffer);
  console.log('Saved quote to:', outputPath);
}

main();
