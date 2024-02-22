const Jimp = require("jimp");

async function generateProfileImage(username, level, friendCode) {
  const image = await Jimp.read("https://i.imgur.com/do9eTuL.png");

  let font = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  let fc = await Jimp.loadFont(Jimp.FONT_SANS_14_BLACK);
  image.print(fc, 202, 126, "DDD-DDD");
  image.print(font, 212, 159, "urionzzz");
  image.print(font, 187, 159, "1");
  image.write("./hi.png");
}

module.exports = generateProfileImage;
