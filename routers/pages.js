let express = require('express');
let route = express.Router();
let db = require('../database/config');
const crypto = require('crypto');
const validOrderStatuses = ['new', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

function requireOrderManager(req, res, next) {
  const password = process.env.ADMIN_PASSWORD || '';
  const header = String(req.headers.authorization || '');
  if (!password || !header.startsWith('Basic ')) {
    res.set('WWW-Authenticate', 'Basic realm="TechStore order management", charset="UTF-8"');
    res.set('Cache-Control', 'no-store');
    return res.status(password ? 401 : 503).send(password ? 'Order manager sign-in required.' : 'Set ADMIN_PASSWORD in .env to enable order management.');
  }

  let credentials;
  try { credentials = Buffer.from(header.slice(6), 'base64').toString('utf8'); } catch (error) { credentials = ''; }
  const colon = credentials.indexOf(':');
  const username = colon < 0 ? '' : credentials.slice(0, colon);
  const suppliedPassword = colon < 0 ? '' : credentials.slice(colon + 1);
  const expected = Buffer.from(password);
  const supplied = Buffer.from(suppliedPassword);
  const valid = username === 'admin' && expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
  if (!valid) {
    res.set('WWW-Authenticate', 'Basic realm="TechStore order management", charset="UTF-8"');
    res.set('Cache-Control', 'no-store');
    return res.status(401).send('Order manager sign-in required.');
  }
  res.set('Cache-Control', 'no-store');
  next();
}

function validCsrfToken(supplied, expected) {
  const received = Buffer.from(String(supplied || ''));
  const stored = Buffer.from(String(expected || ''));
  return received.length > 0 && received.length === stored.length && crypto.timingSafeEqual(received, stored);
}

function query(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, values || [], (error, rows) => error ? reject(error) : resolve(rows));
  });
}

function transaction(method) {
  return new Promise((resolve, reject) => db[method](error => error ? reject(error) : resolve()));
}

function getOrderFormError(req, res, next, message, status = 400) {
  return res.status(status).render('order', {
    title: 'Place your order',
    products: res.locals.cartItems,
    formValues: req.body,
    orderError: message
  });
}

function verifyAdminCsrf(req, res, next) {
  if (validCsrfToken(req.body._csrf, req.session.orderAdminToken)) return next();
  return res.status(403).render('error', {title: 'Reload the admin page', message: 'Your admin session expired. Reload the page and try again.'});
}

function ensureAdminCsrf(req) {
  if (!req.session.orderAdminToken) req.session.orderAdminToken = crypto.randomBytes(32).toString('hex');
  return req.session.orderAdminToken;
}

function productValues(body) {
  return {
    category: Number.parseInt(body.category, 10),
    title: String(body.title || '').trim(),
    details: String(body.details || '').trim(),
    price: Number(body.price),
    picture: String(body.picture || '').trim()
  };
}

function validateProduct(product) {
  if (!Number.isSafeInteger(product.category) || product.category < 1) return 'Choose a product category.';
  if (product.title.length < 2 || product.title.length > 1000) return 'Product name must be between 2 and 1,000 characters.';
  if (product.details.length < 2) return 'Add a short product description.';
  if (!Number.isSafeInteger(product.price) || product.price < 1 || product.price > 2147483647) return 'Enter a whole, positive price in DA.';
  if (product.picture.length > 1000 || (product.picture && !/^[a-z0-9_.-]+\.(jpg|jpeg|png|webp)$/i.test(product.picture) && !/^https?:\/\//i.test(product.picture) && !/^\/(?!\/)[a-z0-9_./-]+$/i.test(product.picture))) return 'Use an image filename or a valid image URL.';
  return null;
}

async function renderProductForm(req, res, product = null, error = null, status = 200) {
  const categories = await query('SELECT id, name FROM categories ORDER BY name');
  res.status(status).render('admin/product-form', {
    title: product ? 'Edit product' : 'Add product',
    product: product || {category: categories.length ? categories[0].id : '', title: '', details: '', price: '', picture: ''},
    categories,
    csrfToken: ensureAdminCsrf(req),
    formError: error
  });
}



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

route.get('/admin/products', requireOrderManager, async function(req, res, next) {
  try {
    const productList = await query('SELECT products.*, categories.name FROM products LEFT JOIN categories ON categories.id=products.category ORDER BY products.pid DESC');
    res.render('admin/products', {title: 'Catalog', productList, saved: req.query.saved === '1', deleted: req.query.deleted === '1', csrfToken: ensureAdminCsrf(req)});
  } catch (error) { next(error); }
});

route.get('/admin/products/new', requireOrderManager, async function(req, res, next) {
  try {
    const categories = await query('SELECT COUNT(*) AS total_categories FROM categories');
    if (!categories[0].total_categories) return res.status(400).render('error', {title: 'Add a category first', message: 'Create a product category in your database before adding products.'});
    await renderProductForm(req, res);
  } catch (error) { next(error); }
});

route.post('/admin/products', requireOrderManager, verifyAdminCsrf, async function(req, res, next) {
  const product = productValues(req.body);
  const error = validateProduct(product);
  if (error) return renderProductForm(req, res, product, error, 400).catch(next);
  try {
    const categories = await query('SELECT id FROM categories WHERE id = ?', [product.category]);
    if (!categories.length) return await renderProductForm(req, res, product, 'That category is no longer available.', 400);
    await query('INSERT INTO products (category, title, details, price, picture) VALUES (?, ?, ?, ?, ?)', [product.category, product.title, product.details, product.price, product.picture || '']);
    res.redirect(303, '/admin/products?saved=1');
  } catch (dbError) { next(dbError); }
});

route.get('/admin/products/:pid/edit', requireOrderManager, async function(req, res, next) {
  try {
    const products = await query('SELECT pid, category, title, details, price, picture FROM products WHERE pid = ?', [req.params.pid]);
    if (!products.length) return res.status(404).render('error', {title: 'Product not found', message: 'This product is no longer in your catalog.'});
    await renderProductForm(req, res, products[0]);
  } catch (error) { next(error); }
});

route.post('/admin/products/:pid/edit', requireOrderManager, verifyAdminCsrf, async function(req, res, next) {
  const product = productValues(req.body);
  const error = validateProduct(product);
  if (error) return renderProductForm(req, res, {...product, pid: req.params.pid}, error, 400).catch(next);
  try {
    const categories = await query('SELECT id FROM categories WHERE id = ?', [product.category]);
    if (!categories.length) return await renderProductForm(req, res, {...product, pid: req.params.pid}, 'That category is no longer available.', 400);
    const existing = await query('SELECT pid FROM products WHERE pid = ?', [req.params.pid]);
    if (!existing.length) return res.status(404).render('error', {title: 'Product not found', message: 'This product is no longer in your catalog.'});
    await query('UPDATE products SET category = ?, title = ?, details = ?, price = ?, picture = ? WHERE pid = ?', [product.category, product.title, product.details, product.price, product.picture || '', req.params.pid]);
    res.redirect(303, '/admin/products?saved=1');
  } catch (dbError) { next(dbError); }
});

route.post('/admin/products/:pid/delete', requireOrderManager, verifyAdminCsrf, async function(req, res, next) {
  try {
    const result = await query('DELETE FROM products WHERE pid = ?', [req.params.pid]);
    if (!result.affectedRows) return res.status(404).render('error', {title: 'Product not found', message: 'This product is no longer in your catalog.'});
    res.redirect(303, '/admin/products?deleted=1');
  } catch (error) { next(error); }
});



  
    route.get('/login', function(req, res) {
      res.render('login', { error: null });
    });

route.get('/checkout', function(req, res) {
  if (!res.locals.cartItems.length) return res.redirect('/cart');
  if (!req.session.orderFormToken) req.session.orderFormToken = crypto.randomBytes(32).toString('hex');
  res.render('order', {title: 'Votre demande de commande', products: res.locals.cartItems, csrfToken: req.session.orderFormToken, orderError: null, formValues: {}});
});

route.post('/checkout', async function(req, res, next) {
  const bag = res.locals.cartItems;
  if (!bag.length) return getOrderFormError(req, res, next, 'Your bag is empty. Add a product before placing an order.');

  const receivedToken = String(req.body._csrf || '');
  const expectedToken = String(req.session.orderFormToken || '');
  if (!validCsrfToken(receivedToken, expectedToken)) {
    return getOrderFormError(req, res, next, 'Your order form expired. Please reload the page and try again.', 403);
  }

  const customer = {
    customer_name: String(req.body.customer_name || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    phone: String(req.body.phone || '').trim(),
    address: String(req.body.address || '').trim(),
    city: String(req.body.city || '').trim(),
    postal_code: String(req.body.postal_code || '').trim(),
    notes: String(req.body.notes || '').trim()
  };
  if (customer.customer_name.length < 2 || customer.customer_name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) || customer.email.length > 254 ||
      !/^[+()\d.\s-]{7,30}$/.test(customer.phone) ||
      customer.address.length < 4 || customer.address.length > 255 ||
      customer.city.length < 2 || customer.city.length > 100 ||
      !customer.postal_code || customer.postal_code.length > 30 || customer.notes.length > 1000) {
    return getOrderFormError(req, res, next, 'Please check your name, email, phone number, delivery address, city, and postal code.');
  }

  const quantities = new Map();
  for (const item of bag) {
    const productId = Number(item.pid);
    const quantity = Number.parseInt(item.qnt, 10);
    if (!Number.isSafeInteger(productId) || productId < 1 || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      return getOrderFormError(req, res, next, 'An item in your bag is invalid. Please update your bag and try again.');
    }
    quantities.set(productId, Math.min(99, (quantities.get(productId) || 0) + quantity));
  }

  let started = false;
  try {
    const ids = [...quantities.keys()];
    const catalog = await query('SELECT pid, title, price FROM products WHERE pid IN (?)', [ids]);
    if (catalog.length !== ids.length) return getOrderFormError(req, res, next, 'A product in your bag is no longer available. Review your bag and try again.');

    const items = catalog.map(product => ({
      product_id: product.pid,
      product_name: product.title,
      quantity: quantities.get(product.pid),
      unit_price: Number(product.price)
    }));
    const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.unit_price * 100) * item.quantity, 0);
    if (!Number.isSafeInteger(subtotalCents) || subtotalCents <= 0) {
      return getOrderFormError(req, res, next, 'We could not calculate your order total. Please contact the store.');
    }

    const orderNumber = 'TS-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(8).toString('hex').toUpperCase();
    await transaction('beginTransaction');
    started = true;
    const order = await query(
      'INSERT INTO orders (order_number, customer_name, email, phone, address, city, postal_code, notes, subtotal, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orderNumber, customer.customer_name, customer.email, customer.phone, customer.address, customer.city, customer.postal_code, customer.notes, (subtotalCents / 100).toFixed(2), 'new', 'cash_on_delivery']
    );
    for (const item of items) {
      await query('INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
        [order.insertId, item.product_id, item.product_name, item.quantity, item.unit_price]);
    }
    await transaction('commit');
    started = false;
    req.session.orderFormToken = crypto.randomBytes(32).toString('hex');
    res.clearCookie('node_express_ecommerce', {path: '/', httpOnly: true, sameSite: 'lax'});
    return res.redirect(303, '/order-confirmation/' + encodeURIComponent(orderNumber));
  } catch (error) {
    if (started) {
      try { await transaction('rollback'); } catch (rollbackError) { console.error('Order rollback failed:', rollbackError.message); }
    }
    return next(error);
  }
});

route.get('/order-confirmation/:orderNumber', async function(req, res, next) {
  const orderNumber = String(req.params.orderNumber || '');
  if (!/^TS-[A-Z0-9]+-[A-F0-9]{16}$/.test(orderNumber)) {
    return res.status(404).render('error', {title: 'Order not found', message: 'We could not find this order reference.'});
  }

  try {
    const orders = await query('SELECT id, order_number, customer_name, email, phone, address, city, postal_code, subtotal, status, payment_method, created_at FROM orders WHERE order_number = ?', [orderNumber]);
    if (!orders.length) return res.status(404).render('error', {title: 'Order not found', message: 'We could not find this order reference.'});
    const items = await query('SELECT product_name, quantity, unit_price FROM order_items WHERE order_id = ? ORDER BY id', [orders[0].id]);
    res.render('order-confirmation', {title: 'Your order is confirmed', order: {...orders[0], items}});
  } catch (error) {
    next(error);
  }
});

route.get('/admin/orders', requireOrderManager, async function(req, res, next) {
  try {
    const orders = await query('SELECT id, order_number, customer_name, email, phone, address, city, postal_code, notes, subtotal, status, payment_method, created_at FROM orders ORDER BY created_at DESC LIMIT 200');
    const counts = await query('SELECT status, COUNT(*) AS count FROM orders GROUP BY status');
    const items = orders.length ? await query('SELECT order_id, product_name, quantity, unit_price FROM order_items WHERE order_id IN (?) ORDER BY order_id, id', [orders.map(order => order.id)]) : [];
    const itemsByOrder = new Map();
    for (const item of items) {
      if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
      itemsByOrder.get(item.order_id).push(item);
    }
    for (const order of orders) order.items = itemsByOrder.get(order.id) || [];
    if (!req.session.orderAdminToken) req.session.orderAdminToken = crypto.randomBytes(32).toString('hex');
    res.render('admin/orders', {title: 'Order requests', orders, counts, validOrderStatuses, csrfToken: req.session.orderAdminToken});
  } catch (error) {
    next(error);
  }
});

route.post('/admin/orders/:orderNumber/status', requireOrderManager, async function(req, res, next) {
  const orderNumber = String(req.params.orderNumber || '');
  const status = String(req.body.status || '');
  if (!validCsrfToken(req.body._csrf, req.session.orderAdminToken)) {
    return res.status(403).render('error', {title: 'Reload your order list', message: 'Your order manager session expired. Reload the list and try again.'});
  }
  if (!/^TS-[A-Z0-9]+-[A-F0-9]{16}$/.test(orderNumber) || !validOrderStatuses.includes(status)) {
    return res.status(400).render('error', {title: 'Invalid order update', message: 'Please select a valid order status and try again.'});
  }
  try {
    const result = await query('UPDATE orders SET status = ? WHERE order_number = ?', [status, orderNumber]);
    if (!result.affectedRows) return res.status(404).render('error', {title: 'Order not found', message: 'We could not find this order reference.'});
    res.redirect(303, '/admin/orders');
  } catch (error) {
    next(error);
  }
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
