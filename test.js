const express = require('express')
const router = express.Router()
var db =require('../db');

router.get('/',(req,res)=> {
    res.render('login_page');
});

router.get('/seclogin',(req,res)=> {
  res.render('seclogin');
});

router.get('/home',(req,res)=> {
    res.render('home');
});


router.get('/navbar',(req,res)=> {
    res.render('navbar');
});

router.get('/homesec',(req,res)=> {
  res.render('homesec');
});

router.get('/pagesec', (req, res) => {
  db.query("SELECT * FROM todo ",(err,row6)=>{
    if(err){
      console.log("err")
    }else{

      res.render('pagesec',{todo:row6});
    }
  })
});

router.get('/secprofile',(req,res)=> {
  db.query("SELECT * FROM secretary WHERE idsec = 1", (error, row3) => {
    if (error) {
      console.log(error);
    } else {
      res.render("secprofile", { infos: row3 });
    }
  });
});

router.get('/appsec',(req,res)=> {
  db.query("SELECT * FROM appointments", (error, app) => {
    if (error) {
      console.log(error);
    } else {
      res.render("appsec", { app: app });
    }
});})

router.get('/appointments',(req,res)=>{
  db.query("SELECT * FROM appointments", (error, app) => {
    if (error) {
      console.log(error);
    } else {
      res.render("appointments", { app: app });
    }
  });
})


router.get('/patient',(req,res)=> {
  let idpatient = req.params['idpatient'];
        db.query("SELECT * FROM patient", (err, data) => {
          if(err) throw err;

        db.query("SELECT * FROM medobservations where idpatient='" + idpatient + "'",(err, row4) => {
          if(err) throw err;
          

        res.render("patient", { data: data, obs :row4 });      
        });     
});
});

router.get('/editpatient/:idpatient' ,(req,res)=>{
  // let idpatient = req.body['idpatient'];
  const idpatient=req.params.idpatient
  db.query("SELECT * FROM patient where idpatient=?",[idpatient], (err, data) => {
    if(err) throw err;

    db.query("SELECT * FROM medobservations where idpatient=?",[idpatient],  (err, row4) => {
    if(err) throw err;
  
     db.query("SELECT * FROM facture where idpatient=?",[idpatient],  (err, row5) => {
       if(err) throw err;

  res.render("editpatient", { data: data, obs :row4, fac:row5});      
  });     

});})})


router.get('/finances/:idpatient',(req,res)=> {
  const idpatient=req.params.idpatient
  db.query("SELECT * FROM patient where idpatient=?",[idpatient], (err, data) => {
    if(err) throw err;

  res.render('finances' ,{ data: data});
});})

router.get('/ordonnance/:idpatient',(req,res)=> {
  const idpatient=req.params.idpatient
    db.query('SELECT * FROM medicament',(err,rows1)=>{
        if(err) throw err;
  
    db.query('SELECT nomanalyse FROM analyse',(err,rows2)=>{
          if(err) throw err;
  
    db.query("SELECT * FROM user WHERE iduser = 1", (err, row3) => {
          if(err) throw err;

          db.query("SELECT * FROM patient WHERE idpatient = ?",[idpatient], (err, row4) => {
            if(err) throw err;
          res.render("ordonnance",{medic : rows1 ,analyse : rows2, infos : row3,  data : row4})
        });
      });
    });})
  })

  
router.get('/doctor',(req,res)=>{

 db.query("SELECT * FROM user WHERE iduser = 1", (error, row3) => {
    if (error) {
      console.log(error);
    } else {
      res.render("doctor", { infos: row3 });
    }
  });
})

router.get('/dashboard',(req,res)=>{
  db.query('SELECT count (*) AS count1 FROM patient', (err, stats1) => {
    if (err) {
      return res.send(err);
    }

    db.query('SELECT COUNT (*) AS count2 FROM appointments', (err, stats2) => {
      if (err) {
        return res.send(err);
      }
         db.query("SELECT COUNT (*) AS count4 FROM patient where gender='Male'", (err, stats4) => {
           if (err) {
             return res.send(err);
           }
           db.query("SELECT COUNT (*) AS count5 FROM patient where gender='Female'", (err, stats5) => {
            if (err) {
              return res.send(err);
            }
            db.query("SELECT COUNT (*) AS count6 FROM appointments where statut='Cancelled'", (err, stats6) => {
              if (err) {
                return res.send(err);
              }
              db.query("SELECT COUNT (*) AS count7 FROM appointments where statut='postponed'", (err, stats7) => {
                if (err) {
                  return res.send(err);
                }
                db.query("SELECT COUNT (*) AS count8 FROM appointments where statut='Done'", (err, stats8) => {
                  if (err) {
                    return res.send(err);
                  }
                  db.query("SELECT COUNT (*) AS count9 FROM appointments where etat='CONSULTATION'", (err, stats9) => {
                    if (err) {
                      return res.send(err);
                    }
                    db.query("SELECT COUNT (*) AS count10 FROM appointments where etat='EXAMINATION'", (err, stats10) => {
                      if (err) {
                        return res.send(err);
                      }
                      db.query("SELECT COUNT (*) AS count11 FROM appointments where etat='ROUTINE-CHECKUP'", (err, stats11) => {
                        if (err) {
                          return res.send(err);
                        }
                        db.query("SELECT COUNT (*) AS count12 FROM appointments where etat='EMERGENCY'", (err, stats12) => {
                          if (err) {
                            return res.send(err);
                          }
                          db.query("SELECT SUM (amount) AS sum1 FROM facture ", (err, stats13) => {
                            if (err) {
                              return res.send(err);
                            }
        res.render('dashboard',{ count1: stats1[0].count1, count2: stats2[0].count2, count4: stats4[0].count4, count5: stats5[0].count5, count8: stats8[0].count8 , count6: stats6[0].count6 , count7: stats7[0].count7 , 
          count9: stats9[0].count9, count10: stats10[0].count10, count11: stats11[0].count11, count12: stats12[0].count12 , sum1: stats13[0].sum1})
      }); });}); });});});}); });});});}); });});


// Logout user
router.get('/logout', (req, res) => {
    // req.session.destroy();
    // req.send('success', 'Login Again Here');
    res.redirect('/');
  });


module.exports = router;