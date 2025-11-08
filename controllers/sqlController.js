const pool = require('../db');
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const csrfProtection = csurf({ cookie: true });
async function handleLogin(req, res) {
    try {
        console.log('Received /sec/login request with body:', req.body);
        const { username, password, vulnerability } = req.body;
        if(vulnerability != undefined && vulnerability === 'on') {
            resultQuery = await pool.query(`SELECT id, username FROM korisnik WHERE username = '${username}' AND password = '${password}'`);
            if (resultQuery.rows.length > 0) {
                console.log(resultQuery);
                res.render('sqli', { results: resultQuery.rows, error: null, oldData: req.body });
            }
            else {
                res.render('sqli', { results: null, error: 'Something went wrong', oldData: req.body });
            }
        }
        else {
            resultQuery = await pool.query('SELECT id, username FROM korisnik where username = $1 AND password = $2', [username, password]);
            if (resultQuery.rows.length > 0) {
                res.render('sqli', { results: resultQuery.rows, error: null, oldData: req.body });
            }
            else {
                res.render('sqli', { results: null, error: 'Something went wrong', oldData: req.body });
            }
        }
    }
    catch (err) {
        console.error('Error handling /sec/login request:', err);
        res.status(500).send('Server error');
    }
}

async function showLoginForm(req, res) {
    try {
        res.render('sqli', { results: null, error: null, oldData: null });
    } catch (err) {
        console.error('Error showing login form:', err);
        res.status(500).send('Server error');
    }
}

async function showcsrfForm(req, res) {
    try {
        res.render('csrf', { results: null, error: null, oldData: null, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error('Error showing login form:', err);
        res.status(500).send('Server error');
    }
}

async function handcsrf(req, res) {
    try {
        console.log('Received /seccsrf/login request with body:', req.body);
        const { username, password, vulnerability } = req.body;
        let protect = vulnerability === 'on';
        protect = !protect;
        res.cookie('session_user', username, { httpOnly: true, sameSite: 'lax' });
        res.cookie('protect_mode', protect ? '1' : '0', { httpOnly: true, sameSite: 'lax' });
        console.log('[LOGIN] user=', username, 'protect_mode=', protect);
        res.redirect('/seccrsf/choice');
    } catch (err) {
        console.error('Error handling /seccsrf/login request:', err);
        res.status(500).send('Server error');
    }
}
async function showAttack(req, res) {
    try {
        res.render('attackcsrf');
    } catch (err) {
        console.error('Error showing attack csrf page:', err);
        res.status(500).send('Server error');
    }
}
async function changeUsername(req, res) {
    if (!req.cookies.session_user) return res.status(401).json({ ok:false, message:'Not logged in' });
    console.log('[CHANGE USERNAME] Request body:', req.body);
    const protectMode = req.cookies.protect_mode === '1';
    let accountusername = req.cookies.session_user;
    console.log('[CHANGE USERNAME] Current user:', accountusername, 'Protect mode:', protectMode);
    if (!protectMode) {
        const oldusername = accountusername;
        accountusername = req.body.newusername || accountusername;
        return res.json({oldusername, newusername: accountusername, message: 'Changed without CSRF protection' });
    }

  csrfProtection(req, res, err => {
    if (err) {
      return res.status(403).json({ ok:false, message: 'CSRF validation failed' });
    }
    const oldusername = accountusername;
    accountusername = req.body.newusername || accountusername;
    return res.json({ oldusername, newusername: accountusername, message: 'Changed with CSRF protection' });
  });
}

async function showChoice(req, res) {
    try {
        res.render('choice');
    } catch (err) {
        console.error('Error showing choice page:', err);
        res.status(500).send('Server error');
    }
}

async function showValid(req, res) {
    try {
        let accountusername = req.cookies.session_user;
        res.render('validcsrf', { csrfToken: req.csrfToken(), oldData: { username: accountusername } });
    } catch (err) {
        console.error('Error showing valid CSRF page:', err);
        res.status(500).send('Server error');
    }
}
async function changeUser(req, res) {
    if (!req.cookies.session_user) return res.status(401).json({ ok:false, message:'Not logged in' });
    console.log('[CHANGE USERNAME - VALID] Request body:', req.body);
    const oldusername = req.cookies.session_user;
    const accountusername = req.body.newusername;
    return res.json({ oldusername, newusername: accountusername, message: 'Changed with CSRF protection' });
}

module.exports = {
    handleLogin,
    showLoginForm,
    showcsrfForm,
    handcsrf,
    showAttack,
    changeUsername,
    showChoice,
    showValid,
    changeUser
};