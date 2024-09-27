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

  tambahSaldo() {
    let next = true;
    let pesan = "";
    do {
      let input = parseFloat(window.prompt("Masukkan jumlah saldo yang ingin ditambahkan"))
      if (!isNaN(input)) {
        this.saldo += input
        pesan = `Saldo sebesar ${input} telah ditambahkan!`
        next = false;
      } else {
        pesan = `Jumlah yang dimasukkan tidak valid!`
      }
      window.alert(pesan)
    } while(next)
    this.cekSaldo();
  }

  kurangiSaldo() {
    let next = true;
    let pesan = "";
    do {
      let input = parseFloat(window.prompt("Masukkan jumlah saldo yang ingin diambil"))
      if (!isNaN(input) && input <= this.saldo) {
        this.saldo -= input
        pesan = `Saldo sebesar ${input} telah diambil!`
        next = false;
      } else if (input > this.saldo) {
        pesan = `Saldo tidak mencukupi!`
      } else {
        pesan = `Jumlah yang dimasukkan tidak valid!`
      }
      window.alert(pesan)
    } while(next)
    this.cekSaldo();
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