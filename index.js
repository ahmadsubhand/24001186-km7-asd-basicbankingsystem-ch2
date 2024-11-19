import express from 'express';
import path from "path";
import userRouters from './routes/user.js'; 
import accoutRouters from './routes/account.js';
import transactionRouters from './routes/transaction.js';
import mailerRouters from './routes/mailer.js';
import publicRouters from './routes/public.js';
import { readFileSync } from "fs";
// import swaggerJSON from './docs/swagger-api-v1.json' assert { type: 'json' };
// import swaggerJSON2 from './swagger-output.json' assert { type: 'json' };
import swaggerUI from 'swagger-ui-express';
import mediaRouter from './routes/media.js';
import morgan from 'morgan';
import "./instrument.js";
import * as Sentry from "@sentry/node";
import dotenv from 'dotenv';
import { createServer } from 'http'; // Gunakan `createServer` untuk server HTTP
import { Server as SocketIOServer } from 'socket.io'; // Gunakan `import` untuk Socket.IO
import jwt from 'jsonwebtoken';

dotenv.config()

const app = express();
const port = process.env.PORT || 3000;
const url_host = process.env.URL_HOST || 'http://localhost';
let swaggerJSON;
try {
  swaggerJSON = JSON.parse(readFileSync("./docs/swagger-api-local.json"));
} catch {
  swaggerJSON = JSON.parse(readFileSync("./docs/swagger-api-v1.json"));
}

// Buat HTTP server
const httpServer = createServer(app);
// Pasang Socket.IO ke HTTP server
const io = new SocketIOServer(httpServer);
const connectedUsers = {};

app.use(morgan('tiny'));
app.use((req, res, next) => {
  // Menyimpan instance io ke dalam res.locals
  res.locals.io = io;
  res.locals.socket = connectedUsers;
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/images', express.static('public/images'));
app.use('/files', express.static('public/files'));
app.use('/public', express.static('public'));

app.use('/api/v1/users', userRouters);
app.use('/api/v1/accounts', accoutRouters);
app.use('/api/v1/transactions', transactionRouters);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON))
app.use('/api/v1/images', mediaRouter);
app.use('/api/v1/email', mailerRouters);
app.use('/public', publicRouters);
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerJSON2))
app.use('/', (req , res) => {
  const filePath = path.join(__dirname, '../../../../../public/index.html');
  res.sendFile(filePath)
})
// io.on('connect', (socket) => {
//   console.log('user conected')
//   socket.on('chat', (data) => {
//     io.sockets.emit('chat',data)
//   })
// })
io.on('connect', (socket) => {
  const token = socket.handshake.auth?.token; // Mengambil token dari handshake

  // Verifikasi token hanya untuk notifikasi (tidak untuk chat)
  if (token) {
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        console.log('Token tidak valid:', err.message);
        socket.disconnect();  // Putuskan koneksi jika token tidak valid
        return;
      }

      const userId = decoded.id;
      socket.userId = userId; // Menyimpan userId dalam objek socket
      connectedUsers[userId] = socket;
      console.log(`User connected: ${userId}`);

      // Kirim pesan 'welcome' kepada pengguna ini (hanya untuk pengguna yang login)
      socket.emit('notification', { message: `Welcome, User ${userId}!`, userId: userId });
    });
  }

  // Menangani event 'chat' untuk broadcast ke semua pengguna
  socket.on('chat', (data) => {
    io.sockets.emit('chat', data);  // Broadcast pesan chat ke seluruh pengguna
  });

  // Menangani event 'notification' untuk notifikasi pribadi ke user tertentu
  socket.on('notification', (data) => {
    if (socket.userId && data.userId === socket.userId) {
      // Kirim notifikasi hanya kepada pengguna yang cocok
      socket.emit('notification', { message: data.message });
      console.log(`Notification sent to User ${socket.userId}`);
    } else {
      console.log(`User ${socket.userId} is not the target of the notification`);
    }
  });
});

Sentry.setupExpressErrorHandler(app);
// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
  next()
});

httpServer.listen(port, () => {
  console.log(`Server is running on ${url_host}:${port}`);
  console.log(`Swagger docs is available at ${url_host}:${port}/api-docs`);
})