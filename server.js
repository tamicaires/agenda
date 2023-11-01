require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.CONNECTIONSTRING)
  .then(()=> {
    app.emit('pronto');
  })
  .catch(e => console.log(e));

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const routes = require('./routes');
const path = require('path');
const helmet = require('helmet')
const csrf = require('csurf')
const { globalMiddleware, checkCsrfError, csrfMiddleware } = require('./src/middlewares/middleware');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

const sessionsOptions = session({
  secret: 'dfghjfkfhflkhllhlhhd  khjklh nikj',
  store: new MongoStore( { mongooseConnection: mongoose.connection} ),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 *7,
    httpOnly: true
  }
});

app.use(sessionsOptions);
app.use(flash());

app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(csrf());

//Nossos próprios Middlewares
app.use(globalMiddleware);
app.use(checkCsrfError);  
app.use(csrfMiddleware);
app.use(routes);

app.on('pronto', () => {
  app.listen(5000, () => {
    console.log('Acessar http://localhost:5000');
  });
});


