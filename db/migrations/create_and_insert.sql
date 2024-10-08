DROP TABLE nasabah;
DROP TABLE akun;
DROP TABLE transaksi;

ALTER TABLE nasabah RENAME TO nasabah_baru;
ALTER TABLE akun RENAME TO akun_baru;
ALTER TABLE transaksi RENAME TO transaksi_baru;

CREATE TABLE nasabah (
    id_nasabah BIGSERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    email VARCHAR(255) NOT NULL,
    no_telepon VARCHAR(15) NOT NULL
);

CREATE TABLE akun (
    id_akun BIGSERIAL PRIMARY KEY,
    saldo BIGINT NOT NULL,
	  id_nasabah BIGINT NOT NULL,
    FOREIGN KEY (id_nasabah) REFERENCES nasabah(id_nasabah) ON DELETE CASCADE
);

CREATE TABLE transaksi (
    id_transaksi BIGSERIAL PRIMARY KEY,
    tanggal_transaksi TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    jumlah BIGINT NOT NULL,
    tipe_transaksi VARCHAR(10) NOT NULL,
    id_akun BIGINT NOT NULL,
	FOREIGN KEY (id_akun) REFERENCES akun(id_akun) ON DELETE CASCADE
);

CREATE INDEX idx_id_nasabah ON akun(id_nasabah);
CREATE INDEX idx_saldo ON akun(saldo);
CREATE INDEX idx_id_akun_transaksi ON transaksi(id_akun);