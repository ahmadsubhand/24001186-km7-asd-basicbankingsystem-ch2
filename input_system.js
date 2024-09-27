const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function readInput(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

function readInputWithError(question, message) {
  return new Promise((resolve) => {
    const askAmount = () => {
      rl.question(question, (input) => {
        const parsedAmount = parseInt(input);
        if (!isNaN(parsedAmount) && parsedAmount > 0) {
          console.log('');
          resolve(parsedAmount);
        } else {
          console.error(message);
          askAmount();
        }
      });
    };
    askAmount();
  });
}

function closeInput() { 
  rl.close();
}

module.exports = { readInput, readInputWithError, closeInput };