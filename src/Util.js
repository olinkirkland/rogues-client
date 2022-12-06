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
  const punctuation = ['.', '?', '!', '...'];
  const sentence =
    sentenceWords.join(' ') +
    punctuation[Math.floor(Math.random() * punctuation.length)];

  return sentence;
}
