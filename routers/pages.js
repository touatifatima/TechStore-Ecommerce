let express = require('express');
let session = require('express-session');
let route = express.Router();
let db = require('../database/config');



route.get('/', function(req, res, next) {
  db.query('SELECT products.*, categories.name FROM products LEFT JOIN categories ON categories.id=products.category ORDER BY pid', function(err, products) {
    if (err) return next(err);
    res.render('home', {title: 'Home', products});
  });
});

route.get('/shop', function(req, res) {
  let products;
  db.query("SELECT * FROM products left join categories on categories.id=products.category", function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      //console.log(result);
      res.render('products', {title: 'Shop', products: result});
    }
  });
});

route.get('/product/:product', function(req, res) {
  let products;
  db.query('SELECT products.*, categories.name FROM products LEFT JOIN categories ON categories.id=products.category WHERE pid = ?', [req.params.product], function (err, result, fields) {
    if (err) {
      throw err;
    } else {
      //console.log(result);
      if (!result.length) return res.status(404).render('error', {title: 'Product not found', message: 'This item is no longer in the collection.'});
      res.render('product', {title: result[0].title, products: result});
    }
  });
});

route.get('/add-to-cart/:product', function(req, res) {
  //Cart through session
  /*if (!Array.isArray(req.session.product)) {
    req.session.product = [];
  }
  req.session.cookie.expires = false;

  req.session.product.push({
    id: req.params.product,
    qnt: 1
  });*/
  //res.send('<h1>'+JSON.stringify(req.session.product)+'</h1>');

  let product = req.params.product.split("-")[1];
  //console.log(product)
  //Cart through cookie
  let products = [];
  if(req.cookies.node_express_ecommerce) {
    products = req.cookies.node_express_ecommerce;
  }
  /*products.push({
    id: req.params.product,
    qnt: 1
  });*/
  db.query("SELECT * FROM products left join categories on categories.id=products.category where pid='"+product+"'", function (err, result, fields) {
    if (err) {
      console.log(err)
      res.render('page', {title: 'About'});
    } else {
      let flag = 0;
      products.forEach(item => {
        if(item.pid == product) {
          flag = 1;
        }
      });
      //console.log(result);
      if(flag == 0) {
        products.push({
          pid: result[0].pid,
          title: result[0].title,
          name: result[0].name,
          price: result[0].price,
          picture: result[0].picture,
          qnt: 1
        });
      }

      //res.send(products);
      res.cookie('node_express_ecommerce', products, {path:'/'});
      res.redirect('/cart');
    }
  });
});

route.get('/remove-from-cart/:index', function(req, res) {
  let products = res.locals.cartItems;
  let index = req.params.index.split("-")[1];
  products.splice(index, 1);
  res.cookie('node_express_ecommerce', products, {path:'/'});
  
  res.redirect('/cart');
});

route.get('/empty-cart', function(req, res) {
  let products = [];
  res.cookie('node_express_ecommerce', products, {path:'/'});
  //req.session.destroy();
  //res.clearCookie('node_express_ecommerce', {path:'/'});
  //console.log(req.cookies.node_express_ecommerce);
  
  res.redirect('/cart');
});

route.get('/cart', function(req, res) {
  let products = [];
  //let session_products = [];

  //Using cookies
  //console.log(req.cookies.node_express_ecommerce);
  if(req.cookies.node_express_ecommerce) {
    res.render('cart', {title: 'Cart', products: req.cookies.node_express_ecommerce});
  } else {
    res.render('cart', {title: 'Cart', products: products});
  }
  
  //Using session
  /*if(req.session.product) {
    req.session.product.forEach(function(product) {
      session_products.push(product.id);
    });
    session_products = session_products.join("\', \'");
    db.query("SELECT * FROM products left join categories on categories.id=products.category where pid in('"+session_products+"')", function (err, result, fields) {
      if (err) {
        throw err;
      } else {
        //console.log(result);
        res.render('cart', {title: 'Cart', products: result});
      }
    });
  } else {
    res.render('cart', {title: 'Cart', products: products});
  }*/
});

route.post('/update-cart', function(req, res) {
  //console.log(req.cookies.node_express_ecommerce);
  let products = res.locals.cartItems;
  products.forEach(function(product, index) {
    product.qnt = Math.max(1, Math.min(99, parseInt((req.body.qnt || [])[index], 10) || 1));
  });
  //console.log(req.body)
  res.clearCookie('node_express_ecommerce', {path:'/'});
  res.cookie('node_express_ecommerce', products);
  res.redirect('/cart');
});


route.post('/search', function(req, res) {
  let query=req.body.query;
  
  db.query('SELECT products.*, categories.name FROM products LEFT JOIN categories ON categories.id=products.category WHERE title LIKE ?', ['%' + String(query || '').slice(0,100) + '%'], function (err, result) {
    if (err) {
      throw err;
    } else {
      //console.log(result);
      res.render('results', {title: 'Search', results: result, query: String(query || '')});
    }
  });
});

//dashboard
// Route for dashboard view
route.get('/dashboard', function(req, res) {
  let data = {};
  
  // Query database for necessary data
  db.query('SELECT COUNT(*) AS total_products FROM products', function(error, results, fields) {
    if (error) throw error;
    data.totalProducts = results[0].total_products;
    
    db.query('SELECT products.category, categories.name, COUNT(*) AS category_count FROM products LEFT JOIN categories ON categories.id=products.category GROUP BY products.category, categories.name', function(error, results, fields) {
      if (error) throw error;
      data.categories = results;
  
      
      // Define labels for the chart
      const labels = results.map(row => row.category);
      
      // Render dashboard view and pass in data and labels
      res.render('dashboard', { title: 'Overview', data, labels });
    });
  });
});



// Import required modules

// Route to display the admin dashboard for managing products
route.get('/admin/products', function(req, res) {
  db.query('SELECT products.*, categories.name FROM products LEFT JOIN categories ON categories.id=products.category', function(error, results, fields) {
    if (error) throw error;
    res.render('admin/products', { title: 'Catalog', productList: results });
  });
});

// Route to add a new product
route.post('/admin/add-product', function(req, res) {
  const newProduct = {
    category: req.body.category,
    title: req.body.title,
    details: req.body.details,
    price: req.body.price,
    picture: req.body.picture
  };
  connection.query('INSERT INTO products SET ?', newProduct, function(error, results, fields) {
    if (error) throw error;
    res.redirect('/admin/products');
  });
});

// Route to display the edit form for an existing product
route.get('/admin/edit-product/:pid', function(req, res) {
  const pid = req.params.pid;
  connection.query('SELECT * FROM products WHERE pid = ?', pid, function(error, results, fields) {
    if (error) throw error;
    res.render('edit-product', { product: results[0] });
  });
});

// Route to update an existing product
route.post('/admin/update-product/:pid', function(req, res) {
  const pid = req.params.pid;
  const updatedProduct = {
    category: req.body.category,
    title: req.body.title,
    details: req.body.details,
    price: req.body.price,
    picture: req.body.picture
  };
  connection.query('UPDATE products SET ? WHERE pid = ?', [updatedProduct, pid], function(error, results, fields) {
    if (error) throw error;
    res.redirect('/admin/products');
  });
});

// Route to delete an existing product
route.post('/admin/delete-product/:pid', function(req, res) {
  const pid = req.params.pid;
  connection.query('DELETE FROM products WHERE pid = ?', pid, function(error, results, fields) {
    if (error) throw error;
    res.redirect('/admin/products');
  });
});



  
    route.get('/login', function(req, res) {
      res.render('login', { error: null });
    });

route.get('/checkout', function(req, res) {
  //res.send('<h1>About page</h1>');
  res.render('order', {title: 'Checkout', products: res.locals.cartItems});
});

route.get('/about', function(req, res) {
  //res.send('<h1>About page</h1>');
  res.render('page', {title: 'About'});
});

route.get('/contact', function(req, res) {
  res.render('page', {title: 'Contact'});
});
// render the search form
route.get('/search', function(req, res) {
  res.render('search', {title: 'search'});
});
route.get('/dashboard', function(req, res) {
  res.render('dashboard', {title: 'dashboard'});
});

route.get("/", (req, res) => {
  res.render("index")
});
route.get('/register', (req, res) => {
  res.render("register")
});

route.get('/login', (req, res) => {
  res.render("login")
});
route.get('/home', (req, res) => {
  res.redirect('/')
});
route.get('/responsable', (req, res) => {
  res.redirect('/dashboard')
});


module.exports = route;