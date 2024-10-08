-- Insert data dummy ke tabel nasabah menggunakan generate_series
INSERT INTO nasabah (nama, alamat, email, no_telepon)
SELECT
    'Customer ' || generate_series(1, 100) AS nama,
    'Jl. Dummy Alamat No. ' || generate_series(1, 100) AS alamat,
    'customer' || generate_series(1, 100) || '@email.com' AS email,
	  '62895' || TRUNC(100000000 + (random() * 899999999)) AS no_telepon
;


-- Insert data dummy ke tabel akun menggunakan generate_series
INSERT INTO akun(saldo, id_nasabah)
SELECT 
	TRUNC(random() * 1000000)::BIGINT AS saldo,
	generate_series(1, 100)
;


-- Proses withdraw
CREATE OR REPLACE PROCEDURE withdraw(
    p_id_akun BIGINT,
    p_jumlah BIGINT
) 
LANGUAGE plpgsql 
AS $$
DECLARE
    saldo_tmp BIGINT;
BEGIN	
	  -- Mendapatkan saldo saat ini
    SELECT saldo INTO saldo_tmp FROM akun WHERE id_akun = p_id_akun;
	
	  -- Memeriksa apakah saldo cukup untuk penarikan
    IF saldo_tmp IS NULL THEN
       	RAISE NOTICE 'Akun tidak ditemukan.';
        RETURN;
    ELSIF saldo_tmp < p_jumlah THEN
        RAISE NOTICE 'Saldo tidak cukup untuk penarikan.';
        RETURN;
    END IF;

    -- Mengurangi saldo akun
    UPDATE akun
    SET saldo = saldo - p_jumlah
    WHERE id_akun = p_id_akun;

    -- Mencatat transaksi
    INSERT INTO transaksi (jumlah, tipe_transaksi, id_akun)
    VALUES (-p_jumlah, 'withdraw', p_id_akun);

    -- Mengembalikan pesan
    RAISE NOTICE 'Penarikan berhasil. Saldo baru: %', (saldo_tmp - p_jumlah);
END;
$$ ;


-- Proses Deposit
CREATE OR REPLACE PROCEDURE deposit(
    p_id_akun BIGINT,
    p_jumlah BIGINT
) 
LANGUAGE plpgsql 
AS $$
DECLARE
    saldo_tmp BIGINT;
BEGIN	
	  -- Mendapatkan saldo saat ini
    SELECT saldo INTO saldo_tmp FROM akun WHERE id_akun = p_id_akun;
	
	  -- Memeriksa apakah akun ditemukan
    IF saldo_tmp IS NULL THEN
       	RAISE NOTICE 'Akun tidak ditemukan.';
        RETURN;
    END IF;

    -- Menambahkan saldo akun
    UPDATE akun
    SET saldo = saldo + p_jumlah
    WHERE id_akun = p_id_akun;

    -- Mencatat transaksi
    INSERT INTO transaksi (jumlah, tipe_transaksi, id_akun)
    VALUES (p_jumlah, 'deposit', p_id_akun);

    -- Mengembalikan pesan
    RAISE NOTICE 'Deposit berhasil. Saldo baru: %', (saldo_tmp + p_jumlah);
END;
$$ ;


-- Proses GetBalance
CREATE OR REPLACE PROCEDURE getBalance(
    p_id_akun BIGINT
)
LANGUAGE plpgsql AS $$
DECLARE
    saldo_tmp BIGINT;
BEGIN
    -- Mendapatkan saldo saat ini
    SELECT saldo INTO saldo_tmp 
    FROM akun 
    WHERE id_akun = p_id_akun;

    -- Memeriksa apakah akun ditemukan
    IF saldo_tmp IS NULL THEN
        RAISE NOTICE 'Akun tidak ditemukan.', p_id_akun;
        RETURN;
    END IF;

    -- Menampilkan saldo saat ini
    RAISE NOTICE 'Saldo akun dengan id %: %', p_id_akun, saldo_tmp;
END;
$$ ;

-- Proses Indexing
CREATE INDEX index_id_nasabah ON akun(id_nasabah);
CREATE INDEX index_saldo ON akun(saldo);
CREATE INDEX index_id_akun_transaksi ON transaksi(id_akun);

-- Contoh penarikan sebesar 50.000 dari akun dengan id_akun = 1
CALL withdraw(1, 50000);

-- Contoh penambahan sebesar 100.000 dari akun dengan id_akun = 1
CALL deposit(1, 100000);

-- Contoh melihat balance dari akun dengan id_akun = 1
CALL getBalance(1);

-- Contoh menghapus akun dengan id_akun = 1
DELETE FROM akun WHERE id_akun = 1;

-- Contoh menghitung akun dengan dengan saldo lebih dari rata-rata
SELECT COUNT(*) FROM akun
WHERE saldo > (SELECT AVG(saldo) FROM akun);

-- Contoh melihat nama customer dari 5 akun dengan saldo terkecil, tetapi saldonya lebih besar dari 200000
SELECT nama, saldo FROM akun 
JOIN nasabah ON akun.id_nasabah = nasabah.id_nasabah 
WHERE akun.saldo > 200000
ORDER BY akun.saldo ASC
LIMIT 5 OFFSET 0;