/**
 * Mengubah angka menjadi kalimat terbilang Rupiah dalam Bahasa Indonesia.
 */
export function terbilang(n: number): string {
  const bilangan = [
    '',
    'Satu',
    'Dua',
    'Tiga',
    'Empat',
    'Lima',
    'Enam',
    'Tujuh',
    'Delapan',
    'Sembilan',
    'Sepuluh',
    'Sebelas',
  ];

  const absN = Math.floor(Math.abs(n));

  function konversi(angka: number): string {
    if (angka < 12) {
      return bilangan[angka];
    } else if (angka < 20) {
      return konversi(angka - 10) + ' Belas';
    } else if (angka < 100) {
      return konversi(Math.floor(angka / 10)) + ' Puluh ' + konversi(angka % 10);
    } else if (angka < 200) {
      return 'Seratus ' + konversi(angka - 100);
    } else if (angka < 1000) {
      return konversi(Math.floor(angka / 100)) + ' Ratus ' + konversi(angka % 100);
    } else if (angka < 2000) {
      return 'Seribu ' + konversi(angka - 1000);
    } else if (angka < 1000000) {
      return konversi(Math.floor(angka / 1000)) + ' Ribu ' + konversi(angka % 1000);
    } else if (angka < 1000000000) {
      return konversi(Math.floor(angka / 1000000)) + ' Juta ' + konversi(angka % 1000000);
    } else if (angka < 1000000000000) {
      return konversi(Math.floor(angka / 1000000000)) + ' Milyar ' + konversi(angka % 1000000000);
    } else {
      return konversi(Math.floor(angka / 1000000000000)) + ' Triliun ' + konversi(angka % 1000000000000);
    }
  }

  if (absN === 0) return 'Nol Rupiah';
  const hasil = konversi(absN).replace(/\s+/g, ' ').trim();
  return `${n < 0 ? 'Minus ' : ''}${hasil} Rupiah`;
}
