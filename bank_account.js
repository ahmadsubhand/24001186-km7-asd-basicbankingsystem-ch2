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
    this._owner = owner;
    this._balance = balance;
    console.log(`Welcome ${_owner}!\n${this.getBalance()}\n`);
  }

  deposit(amount) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount > 0) {
          this._balance += amount;
          resolve(`Deposit of ${amount} successful. New balance: ${this._balance}.\n`);
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
        if (amount > 0 && amount <= this._balance) {
          this._balance -= amount;
          resolve(`Withdraw of ${amount} successful. New balance: ${this._balance}.\n`);
        } else if (this._balance == 0) {
          reject(new InsufficientFundsError(`You tried to withdraw, but your balance is empty.\n`))
        } else if (amount <= 0) {
          reject(new InvalidTransactionError(`Withdraw amount must be greater than zero.\n`));
        } else if (amount > this._balance) {
          reject(new InsufficientFundsError(`You tried to withdraw ${amount}, but your balance is only ${this._balance}.\n`));
        } else {
          reject(new DataValidationError(`Please enter a valid number.\n`));
        }
      }, 2000);
    });
  }

  cekSaldo() {
    window.alert(`Saldo yang Anda miliki saat ini sebesar ${this.saldo}`);
  }
}

window.onload = () => {
  let next = true;
  let nasabah = new BankAccount(0, "Ahmad Subhan Daryhadi");
  do {
    let pilihan = parseInt(window.prompt(
      `Menu\n1. Cek Saldo\n2. Tambah Saldo\n3. Kurang saldo\n4. Keluar\nPilih menu yang akan Anda lakukan...`
    ))
    switch (pilihan) {
      case 1:
        nasabah.cekSaldo();
        break;
      case 2:
        nasabah.tambahSaldo();
        break;
      case 3:
        nasabah.kurangiSaldo();
        break;
      case 4:
        window.alert("Terimakasih sudah menggunakan aplikasi!")
        next = false;
        break;
      default:
        window.alert("Silahkan masukkan angka yang valid! (1-4)")
        break;
    }
  } while(next)
}