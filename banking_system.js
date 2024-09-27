const { BankAccount, errorMessage } = require('./bank_account');
const { readInput, readInputWithError, closeInput } = require('./input_system');

async function main() {
  const name = await readInput("Please enter your name: ");
  const balance = await readInputWithError(
    "Please enter your first balance: ",
    "<!> Invalid data: Please enter a number greater than 0."
  );

  const account = new BankAccount(name, balance);

  let next = 1;
  do {
    const choice = parseInt(await readInput("Menu\n1. Withdraw\n2. Deposit\n3. Check Balance\nPlease select what you want to do: "));

    switch (choice) {
      case 1: {
        const amount = parseFloat(await readInput("Please enter the amount to be withdrawn: "));

        try {
          const result = await account.withdraw(amount);
          console.log(result);
        } catch (error) {
          console.log(errorMessage(error));
        }

        break;
      }
      
      case 2: {
        const amount = parseFloat(await readInput("Please enter the amount to be deposited: "));

        try {
          const result = await account.deposit(amount);
          console.log(result);
        } catch (error) {
          console.log(errorMessage(error));
        }

        break;
      }

      case 3: {
        console.log(account.getBalance());
        break;
      }
      
      default:
        console.error("<!> Invalid data: Please enter a number between 1-3.\n");
        break;
    }

    next = parseInt(await readInput('Do you want to make another transaction or exit app? (1/0) '));
    while (next != 0 && next != 1) {
      console.error(`<!> Invalid data: Please enter a number between 1 or 0.\n`);
      next = parseInt(await readInput('Do you want to make another transaction or exit app? (1/0) '));
    }

  } while(next);

  console.log(`Thanks for using this app. See you again ${name}!`);
  closeInput();
}

main();