import QRCode from 'qrcode';

QRCode.toFile(
  './public/qr/youtube_qr.png', 
  'https://www.youtube.com', 
  {
    color: {
      dark: '#00F',  // Blue dots
      light: '#0000' // Transparent background
    }
  },
  err => {
    if (err) throw err
    console.log('done')
  }
);