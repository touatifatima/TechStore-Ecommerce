/**
 * Create express object.
 */
var express = require('express');
/**
 * Session object declear
 */
var session = require('express-session');
/**
 * Cookie object declear
 */
var cookieParser = require('cookie-parser');
/**
 * Create app object & assign express object.
 */
var app = express();
/**
 * Create reload object.
 */
var reload = require('reload');
/**
 * For set port or default 7000 posr.
 */
app.set('port', process.env.POST || 7000);
/**
 * Set view engine & point a view folder.
 */
app.set('view engine', 'ejs');
app.set('views', 'views');
/**
 * Register cookie
 */
app.use(cookieParser());
/**
 * Register session with secret key
 */
app.use(session({secret: 'kak'}));
/**
 * Add & register body parser
 */
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
/**
 * Set site title.
 */
app.locals.siteTitle = 'Ecommerce';
/**
 * set public folder is static to use any where.
 * Public folder contents js, css, images
 */
app.use(express.static('public'));
/**
 * Add routes.
 */
app.use(require('./routers/pages'));
/**
 * Cache
 */
/*app.use(function (req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  // -1 setting up request as expired and re-requesting before display again. 
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});*/



var passport = require("passport")
var session = require("express-session")
var GitHubStrategy = require("passport-github2").Strategy

const GITHUB_CLIENT_ID = "your-client-id-here" // or get from process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = "your-client-secret-here" // or get from process.env.GITHUB_CLIENT_SECRET
const GITHUB_CALLBACK_URL = "http://localhost:5000/auth/github/callback" // or get from process.env.GITHUB_CALLBACK_URL

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect("/login")
}

passport.serializeUser(function(user, done) {
  done(null, user)
})

passport.deserializeUser(function(obj, done) {
  done(null, obj)
})

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL
    },
    function(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      console.log({ accessToken, refreshToken, profile })
      
      // an example of how you might save a user
      // new User({ username: profile.username }).fetch().then(user => {
      //   if (!user) {
      //     user = User.forge({ username: profile.username })
      //   }
      // 
      //   user.save({ profile: profile, access_token: accessToken }).then(() => {
      //     return done(null, user)
      //   })
      // })
    }
  )
)
app.use(
  session({ secret: "keyboard cat", resave: false, saveUninitialized: false })
)
app.use(passport.initialize())
app.use(passport.session())

app.get("/", (req, res) => {
  res.send("<a href='/secret'>Access Secret Area</a>")
})

app.get("/login", (req, res) => {
  res.send("<a href='/auth/github'>Sign in With GitHub</a>")
})

app.get("/secret", ensureAuthenticated, (req, res) => {
  res.send(`<h2>yo ${req.user}</h2>`)
})

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["repo:status"] }), /// Note the scope here
  function(req, res) { }
)

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/")
  }
)

const port = process.env.PORT || 5000
app.listen(port, () => console.log(`listening on port ${port}`))

/**
 * Create server.
 */
var server = app.listen(7000, function() {
  console.log('Running server');
})
/**
 * Auto reload server.
 */