require('dotenv').config()
const express = require('express')
const app = express()
app.set("view engine", "ejs");
const sqlController =  require('./controllers/sqlController');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const csrfProtection = csurf({ cookie: true });
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 3000;
app.get('/', (req, res) => {
  res.render('main');
});
app.get('/sec/login', sqlController.showLoginForm);
app.post('/sec/login', sqlController.handleLogin);

app.get('/seccsrf/login', csrfProtection, sqlController.showcsrfForm);
app.post('/seccsrf/login', csrfProtection, sqlController.handcsrf);
app.get('/seccrsf/choice', sqlController.showChoice);


app.get('/attackcsrf', sqlController.showAttack);
app.get('/validcsrf', csrfProtection, sqlController.showValid);
app.post('/validcsrf', csrfProtection, sqlController.changeUser);
app.post('/attackcsrf', sqlController.changeUsername);
if (externalUrl) {
  const hostname = '0.0.0.0';
  app.listen(port, hostname, () => {
    console.log(`Server locally running on http://${hostname}:${port}/ and externally on ${externalUrl}`)
  })
}
else {
  app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  })
}