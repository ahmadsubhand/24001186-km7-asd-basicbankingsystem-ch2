const { BankAccount, errorMessage } = require('./bank_account');
const { readInput, readInputWithError, closeInput } = require('./input_system');

async function main() {
  const name = await readInput("Please enter your name: ");
  const balance = await readInputWithError(
    "Please enter your first balance: ",
    "<!> Invalid data: Please enter a number greater than 0."
  );

  const account = new BankAccount(name, balance);
  closeInput();
}

main();