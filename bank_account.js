class InsufficientFundsError extends Error {
  constructor(message) {
    super(message);
    this.name = "InsufficientFundsError";
  }
}

class DataValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DataValidationError";
  }
}

class InvalidTransactionError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidTransactionError";
  }
}

function errorMessage(error) {
  if (error instanceof InsufficientFundsError) {
    return `<!> Insufficient funds: ${error.message}`;
  } else if (error instanceof DataValidationError) {
    return `<!> Invalid data: ${error.message}`;
  } else if (error instanceof InvalidTransactionError) {
    return `<!> Invalid funds: ${error.message}`;
  } else {
    return `<!> Unexpected error: ${error.name}`;
  }
}

class BankAccount {
  constructor(owner, balance = 0) {
    this.owner = owner;
    this.balance = balance;
    console.log(`Welcome ${owner}!\n${this.getBalance()}\n`);
  }

  deposit(amount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount > 0) {
          this.balance += amount;
          resolve(`Deposit of ${amount} successful. New balance: ${this.balance}.\n`);
        } else if (amount <= 0) {
          reject(new InvalidTransactionError(`Deposit amount must be greater than zero.\n`));
        } else {
          reject(new DataValidationError(`Please enter a valid number.\n`));
        }
      }, 2000);
    });
  }

  withdraw(amount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount > 0 && amount <= this.balance) {
          this.balance -= amount;
          resolve(`Withdraw of ${amount} successful. New balance: ${this.balance}.\n`);
        } else if (this.balance == 0) {
          reject(new InsufficientFundsError(`You tried to withdraw, but your balance is empty.\n`))
        } else if (amount <= 0) {
          reject(new InvalidTransactionError(`Withdraw amount must be greater than zero.\n`));
        } else if (amount > this.balance) {
          reject(new InsufficientFundsError(`You tried to withdraw ${amount}, but your balance is only ${this.balance}.\n`));
        } else {
          reject(new DataValidationError(`Please enter a valid number.\n`));
        }
      }, 2000);
    });
  }

  getBalance() {
    return `Current balance: ${this.balance}`;
  }
}

module.exports = { BankAccount, errorMessage };
