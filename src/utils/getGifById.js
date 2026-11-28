require('dotenv').config();
async function getGifById(gifId) {
  console.log(gifId);
  const apiKey = process.env.GIPHY_API;
  const url = `https://api.giphy.com/v1/gifs/${gifId}?api_key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (
      data.data &&
      data.data.images &&
      data.data.images.original &&
      data.data.images.original.url
    ) {
      const gifUrl = data.data.images.original.url;
      console.log(gifUrl);
      return gifUrl;
    } else {
      console.log('Kein GIF gefunden.');
      return 'Kein GIF gefunden.';
    }
  } catch (error) {
    console.error('Fehler beim Abrufen des GIFs:', error);
    return 'Fehler beim Abrufen des GIFs.';
  }
}

module.exports = getGifById;
