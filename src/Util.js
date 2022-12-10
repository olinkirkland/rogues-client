export function lorem() {
  const words = [
    'lorem',
    'ipsum',
    'dolor',
    'sit',
    'amet',
    'consectetur',
    'adipiscing',
    'elit',
    'sed',
    'do',
    'eiusmod',
    'tempor',
    'incididunt',
    'ut',
    'labore',
    'et',
    'dolore',
    'magna',
    'aliqua',
    'ut',
    'enim',
    'ad',
    'minim'
  ];
  const numberOfWords = Math.floor(Math.random() * 6 + 6);
  let sentenceWords = [];
  for (let i = 0; i < numberOfWords; i++) {
    sentenceWords.push(words[Math.floor(Math.random() * words.length)]);
  }

  // Capitalize the first letter
  sentenceWords[0] =
    sentenceWords[0].charAt(0).toUpperCase() + sentenceWords[0].slice(1);
  const sentence = sentenceWords.join(' ') + Math.random() < 0.8 ? '.' : '?';
  return sentence;
}

const pastelColors = [
  '#FFB3BA',
  '#FFDFBA',
  '#FFFFBA',
  '#BAFFC9',
  '#BAE1FF',
  '#D0BAFF',
  '#FFBAF2'
];
let lastColor = null;
export function randomColor() {
  let color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
  return color === lastColor ? randomColor() : (lastColor = color);
}