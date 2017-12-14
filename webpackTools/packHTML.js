import fs from 'fs';
import cheerio from 'cheerio';

fs.readFile('src/index.html', 'utf8', (readError, markup) => {
  if (readError) {
    return readError;
  }

  const $ = cheerio.load(markup);

  fs.writeFile('build/index.html', $.html(), 'utf8', (writeError) => {
    if (writeError) {
      console.log(writeError);
      return writeError;
    }

    return writeError;
  });

  return 0;
});
