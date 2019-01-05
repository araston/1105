const express = require('Express');
var app = express()
var mongoose = require('mongoose');
var multer = require('multer');
var router = express.Router();
bodyParser = require('body-parser');
path = require('path');
var assert = require('assert');
var Schema = mongoose.Schema;
var autoincrement = require('mongoose-auto-increment');
var MongoClient = require('mongodb').MongoClient;
var autoIncrementmongo = require("mongodb-autoincrement");
const fs = require('fs');
var url = "mongodb://localhost:27017/omdehchi";

const hostname = 'localhost';
const port = 8000;
var https = require('https');
var microtime = require('microtime');
var request = require('request');
var server = require('http').Server(app);
var io = require('socket.io')(server);
app.use(express.static('../uploads'))
//get json post data
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//--------

//jalali datetime
//const JDate = require('jalali-date');
//const jdate = new JDate;

var moment = require('jalali-moment');

//------------------
/*mongoose.connect(url,function(err){
  if (err){
    console.log(err);
  }else{
    console.log('mongoose connected')
  }

})*/
//handling multer
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '../uploads/images')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + '.jpg')
    }
});

var upload = multer({storage: storage,
    fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
            return callback(new Error('Only images are allowed'))
        }
        callback(null, true)
    },
    limits:{
        fileSize: 610 * 610
    }
  });


  //register new seller --------------------------------------------------------------
  app.post('/registerseller', (req, res, next) => {
   //console.log(req.body);
   //verify if the user is regeistered or no
   MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {

   if (err) throw err;
   var dbo = db.db("omdehchi");
   var query2 = { mobile:req.query.mobile};

   dbo.collection("seller").count(query2, { limit: 1 })
    .then((count) => {
      if (count == 0) {
        //console.log('Username exists.');



   //console.log('Username exists.' + req.body.mobile);
   if(!req.body.name || !req.body.mobile || !req.body.province ||!req.body.cat1 ||!req.body.address)
  {
    res.json({'result': 'Error','message': 'fields are not complete'});
  }else {

   /*var images = [];
   var ss = req.files;


       var originalName = ss[0].originalname;
       var filename = ss[0].filename;
       image = "/images/" + filename;*/



autoIncrementmongo.getNextSequence(db, "seller", function (err, autoIndex) {

   var myobj = {_id: autoIndex,cat1:req.body.cat1,cat2:req.body.cat2,cat3:req.body.cat3,name: req.body.name, province: req.body.province,city: req.body.city,address:req.body.address, datetime: Date.now(), mobile: req.body.mobile, tell: req.body.tell, lat: req.body.lat, long: req.body.long ,
      score: "0",level: "",numrequestfee:"",numorder:""};

    dbo.collection("seller").insertOne(myobj, function(err, mongoResponse) {

    console.log("1 seller regestered");
    res.json({'result': 'OK','message': 'register successfully','id':autoIndex});
     db.close();
   });
 });
     assert.equal(null, err);


  }
}
});
  });
  });
  //end of register new seller --------------------------------------------------------------

  //register new customer --------------------------------------------------------------
  app.post('/registercustomer', upload.any(), (req, res, next) => {
   console.log(req.body);

   if(!req.body.mobile)
  {
    res.json({'result': 'Error','message': 'fields are not complete'});
  }else {


  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
   autoIncrementmongo.getNextSequence(db, "customer", function (err, autoIndex) {
    var dbo = db.db("omdehchi");
   var myobj = { mobile: req.body.mobile,name:"",lastname:"",address:"",lat:"",long:"",codeposti:"",tell:"",numsuggest:0,numorder:0,numreject:0 };
    dbo.collection("customer").insertOne(myobj, function(err, mongoResponse) {

    console.log("1 customer regestered");
    res.json({'result': 'OK','message': 'register successfully'});
     db.close();
   });
 });
     assert.equal(null, err);

      });
  }
  });
  //end of register new customer --------------------------------------------------------------
//info customer
app.get("/customerinfo",(req,res) => {
MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
    var dbo = db.db("omdehchi");
    var query = { mobile: req.query.mobile };
    //dbo.collection("customer").find(query).toArray(function(err, result) {
      dbo.collection("customer").find(query).limit(1).toArray(function(err, result) {
     if (err) throw err;



    res.json(result);
    db.close();
  });
});
//res.send("dddd");
});
//end of info customer
//customer suggestions --------------------------------------------------------------
app.get("/customersuggest",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
    var dbo = db.db("omdehchi");
    var query = { mobilecustomer: req.query.mobile,status: req.query.status };
    dbo.collection("suggestions").find(query).toArray(function(err, result) {
     if (err) throw err;


    res.json(result);
    db.close();
  });
});
});
//end customer suggestions --------------------------------------------------------------

//create new product --------------------------------------------------------------
app.post('/createpdc', upload.any(), (req, res, next) => {
 console.log(req.body);

 if(!req.body.name || !req.body.price || !req.body.mobileseller || !req.body.cat || !req.body.shipping || !req.files[0])
{
  res.json({'result': 'Error','message': 'fields are not complete'});
}else {

 var images = [];
 var ss = req.files;
 if (ss.length < 3) {
   for(var j=0; j<ss.length; j++){

     var originalName = ss[j].originalname;
     var filename = ss[j].filename;
     images.push("/images/" + filename);
   }

MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
 if (err) throw err;
  autoIncrementmongo.getNextSequence(db, "products", function (err, autoIndex) {
  var dbo = db.db("omdehchi");
  //var myobj = { name: req.body.name, describe: req.body.describe, price: req.body.price, cat: req.body.cat,brand: req.body.brand,state: "1", exist: "yes", datetime: Date.now(), mobileseller: req.body.mobileseller, images: images ,shipping: req.body.shipping,specification:req.body.specification};
  var myobj = { _id: autoIndex,name: req.body.name, describe: req.body.describe, cat: req.body.cat,brand: req.body.brand,specification:req.body.specification,
    state: "1", datetime: Date.now(), images: images ,
  madeby:req.body.madeby,gurantee:req.body.gurantee};
  dbo.collection("products").insertOne(myobj, function(err, mongoResponse) {

  console.log("1 document inserted");
  res.json({'result': 'OK','message': 'product created successfully'});
   db.close();
 });
});
   assert.equal(null, err);

    });
  }else{
      res.json({'result': 'Error','message': 'at least 3 image is valid'});
  }
}
});
//end of create new product --------------------------------------------------------------

//show products
app.get("/products",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
    var dbo = db.db("omdehchi");

  //dbo.collection("products").find({}).toArray(function(err, result) {
   dbo.collection("products").aggregate([
    { $lookup:
       {
         from: 'tenders',
         localField: '_id',
         foreignField: 'idpdc',
         as: 'tenders'
       }
     }
    ]).toArray(function(err, result) {
    if (err) throw err;
    //console.log(result);
    //dbo.collection("products").find().toArray(function(err, result) {
   //get lifetimetender

     dbo.collection("lifetimetender").findOne({},function(err, lifetimetender1) {
          if (err) throw err;
        var lifetimetender = lifetimetender1;

 //});
 //------------------------
    res.json({result,nowmicrotime:Date.now(),lifetimetender:lifetimetender});
   });
    db.close();
  });
//});
});
});
//end of show products
//get products of category
app.get("/productscat",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
    var dbo = db.db("omdehchi");
    //var query = { cat: req.query.idcat };
    //var mysort = { _id: -1 };
   //dbo.collection("products").find(query).toArray(function(err, result) {
//dbo.collection("products").find({}).toArray(function(err, result) {
dbo.collection("products").aggregate([
  {$match: {cat: req.query.idcat}
  },
 { $lookup:
    {
      from: 'tenders',
      localField: '_id',
      foreignField: 'idpdc',
      as: 'tenders'
    }
  }
 ]).toArray(function(err, result) {
   dbo.collection("lifetimetender").findOne({},function(err, lifetimetender1) {
        if (err) throw err;
      var lifetimetender = lifetimetender1;

res.json({result,nowmicrotime:Date.now(),lifetimetender:lifetimetender});

     db.close();
   });
 });
 });
 });
 //end of get products of category
//get tenders of product
app.get("/tendersofproduct",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
    var dbo = db.db("omdehchi");
    var query = { idpdc: parseInt(req.query.idpdc) };
    var mysort = { _id: -1 };
   dbo.collection("tenders").find(query).sort(mysort).toArray(function(err, result) {
//dbo.collection("products").find({}).toArray(function(err, result) {
     if (err) throw err;
     //console.log(result);
     //dbo.collection("products").find().toArray(function(err, result) {
    //get lifetimetender


  //});
  //------------------------
     res.json({result});

     db.close();
   });
 //});
 });
 });
 //--------------------
 app.get("/tendersofcats",(req,res) => {
   MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
    if (err) throw err;
     var dbo = db.db("omdehchi");
     var query = { cat: req.query.idcat1 ,active:"yes" };
     if (req.query.idcat2){
       query = { $or: [{cat: req.query.idcat1,active:"yes"},{cat: req.query.idcat2,active:"yes"}] };
         //console.log("fffff");
     }
     if (req.query.idcat3){
       query = { $or: [{cat: req.query.idcat1,active:"yes"},{cat: req.query.idcat2,active:"yes"},{cat: req.query.idcat3,active:"yes"}] };

     }
     var mysort = { _id: -1 };
    //dbo.collection("tenders").find(query).sort(mysort).toArray(function(err, result) {

 dbo.collection("tenders").aggregate([
   //{$match: {cat: req.query.idcat1,active:"yes"}},
   {$match: query},
    { $sort: { _id: -1 } },
  { $lookup:
     {
       from: 'products',
       localField: 'idpdc',
       foreignField: '_id',
       as: 'product'
     }
   }
  ]).toArray(function(err, result) {
      if (err) throw err;
      //console.log(result);
      //dbo.collection("products").find().toArray(function(err, result) {
     //get lifetimetender


   //});
   //------------------------
      res.json({result,nowmicrotime:Date.now()});

      db.close();
    });
  //});
  });
  });
  //--------------------
 //show user tenders
 app.get("/tendersofuser",(req,res) => {
   MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
    if (err) throw err;
     var dbo = db.db("omdehchi");

   //dbo.collection("products").find({}).toArray(function(err, result) {
    dbo.collection("tenders").aggregate([
      {$match: {idcustomer: parseInt(req.query.idcustomer)}},
       { $sort: { _id: -1 } },
     { $lookup:
        {
          from: 'products',
          localField: 'idpdc',
          foreignField: '_id',
          as: 'product'
        }
      }
     ]).toArray(function(err, result) {
     if (err) throw err;
     //console.log(result);
     //dbo.collection("products").find().toArray(function(err, result) {
    //get lifetimetender

      dbo.collection("lifetimetender").findOne({},function(err, lifetimetender1) {
           if (err) throw err;
         var lifetimetender = lifetimetender1;

  //});
  //------------------------
     res.json({result,nowmicrotime:Date.now(),lifetimetender:lifetimetender});
    });
     db.close();
   });
 //});
 });
 });
 //end of user tenders
 //show user tenders
 app.get("/inquiryofuser",(req,res) => {
   MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
    if (err) throw err;
     var dbo = db.db("omdehchi");
     var query = { idcustomer: req.query.idcustomer};
   //dbo.collection("inquiry").find(query).toArray(function(err, result) {
     dbo.collection("inquiry").find(query).toArray(function(err, result) {
  /*  dbo.collection("inquiry").aggregate([
      {$match: {idcustomer: parseInt(req.query.idcustomer)}},
       { $sort: { _id: -1 } },
     { $lookup:
        {
          from: 'products',
          localField: 'idpdc',
          foreignField: '_id',
          as: 'product'
        }
      }
    ]).toArray(function(err, result) {*/
     if (err) throw err;

  //------------------------
     res.json({result});
    });
     db.close();
   });
 //});

 });
 //end of user tenders


//show user tenders
app.get("/tendersofseller",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
    var dbo = db.db("omdehchi");

  //dbo.collection("products").find({}).toArray(function(err, result) {

   dbo.collection("tenders").aggregate([
     {$match: {'pricesuggests.idseller': parseInt(req.query.idseller)}},

    { $sort: { _id: -1 } },
    { $lookup:
       {
         from: 'products',
         localField: 'idpdc',
         foreignField: '_id',
         as: 'product'
       }
     }
    ]).toArray(function(err, result) {
    if (err) throw err;
    //console.log(result);
    //dbo.collection("products").find().toArray(function(err, result) {
   //get lifetimetender

     dbo.collection("lifetimetender").findOne({},function(err, lifetimetender1) {
          if (err) throw err;
        var lifetimetender = lifetimetender1;

 //});
 //------------------------
    res.json({result,nowmicrotime:Date.now(),lifetimetender:lifetimetender});
   });
    db.close();
  });
//});
});
});
//end of user tenders
//seller inquiry
app.get("/inquiryofseller",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
    var dbo = db.db("omdehchi");
    var query = { idseller: req.query.idseller};
  //dbo.collection("inquiry").find(query).toArray(function(err, result) {
    dbo.collection("inquiry").find(query).toArray(function(err, result) {
 /*  dbo.collection("inquiry").aggregate([
     {$match: {idcustomer: parseInt(req.query.idcustomer)}},
      { $sort: { _id: -1 } },
    { $lookup:
       {
         from: 'products',
         localField: 'idpdc',
         foreignField: '_id',
         as: 'product'
       }
     }
   ]).toArray(function(err, result) {*/
    if (err) throw err;

 //------------------------
    res.json({result});
   });
    db.close();
  });
//});

});
//end of seller inquiry
//create new specification --------------------------------------------------------------
/*function functionName() {

 console.log(req.body);

 if(!req.body.name || !req.body.price || !req.body.mobileseller || !req.body.cat || !req.body.shipping || !req.files[0])
{
  res.json({'result': 'Error','message': 'fields are not complete'});
}else {

 var images = [];
 var ss = req.files;
   for(var j=0; j<ss.length; j++){

     var originalName = ss[j].originalname;
     var filename = ss[j].filename;
     images.push("/images/" + filename);
   }

MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
 if (err) throw err;
  var dbo = db.db("omdehchi");
  var myobj = { name: req.body.name, describe: req.body.describe, price: req.body.price, cat: req.body.cat,brand: req.body.brand,specification:req.body.specification,
    state: "1", exist: "yes", datetime: Date.now(), mobileseller: req.body.mobileseller, images: images ,shipping: req.body.shipping,
  madeby:req.body.madeby,gurantee:req.body.gurantee};
  dbo.collection("products").insertOne(myobj, function(err, mongoResponse) {


  }
  console.log("1 document inserted");
  res.json({'result': 'OK','message': 'product created successfully'});
   db.close();
 });

   assert.equal(null, err);

    });
}

}*/
//end of create new specification --------------------------------------------------------------
//categories
app.get("/categories",(req,res) => {
  let rawdata = fs.readFileSync('../cat.json');
  let cats = JSON.parse(rawdata);
  res.send(cats)


})
;

//brands
app.get("/brands",(req,res) => {
  let rawdata = fs.readFileSync('../brand.json');
  let specification = JSON.parse(rawdata);
  res.send(specification)

});

//specification
app.get("/specification",(req,res) => {
  let rawdata = fs.readFileSync('../specification.json');
  let specification = JSON.parse(rawdata);
  res.send(specification)

});

//send sms
app.get("/sms",(req,res) => {
var smscode = Math.floor(10000 + Math.random() * 90000);
var options = {
  uri: 'http://37.130.202.188/api/select',
  method: 'POST',
  json: {
    "op" : "send",
	"uname" : "araston",
	"pass":  "8221105",
	"message" : " کد تایید عمده چی: " + smscode ,
	"from": "+985000241291",
	"to" : [req.query.mobile],
	"time" : ""
  }
};
//console.log("sms sent successful" + req.query.mobile)
request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    //console.log("sms sent successful")
    var result = {
      result: 'OK',
      describe: "پیامک ارسال شد",
      mobile: req.query.mobile,

    };
    res.json(result); // Print the shortened url.*/
   //res.send("fffffff");
//save sms info in db
MongoClient.connect(url, (err, db) => {

if (err) throw err;
var dbo = db.db("omdehchi");


autoIncrementmongo.getNextSequence(db, "smsinfo", function (err, autoIndex) {

   var myobj = {_id: autoIndex,mobile:req.query.mobile,smscode:smscode};

    dbo.collection("smsinfo").insertOne(myobj, function(err, mongoResponse) {

   });

   setTimeout(function(str1, str2) {
     //io.emit("tenderexpired" , autoIndex);
     var myquery = {_id: autoIndex};
     dbo.collection("smsinfo").deleteOne(myquery, function(err, obj) {
     if (err) throw err;
     console.log("1 document deleted");
     db.close();
 });

      console.log(str1 + " " + str2);
    }, 1000000, "Hello.", "one smscode expired");

});
});
}else{
  /*var result = {
    result: 'Error',
    describe: "ارسال پیامک با مشکل مواجه شد",
    mobile: req.query.mobile,

  };
  res.json(result);*/
}
});
});
//end of send sms
//sms verification
app.get("/smsverifyseller",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
     if (err) throw err;
      var dbo = db.db("omdehchi");
      var resultfinal = {};

         //var status = "not registered";
      //verify if the user is regeistered or no
  //console.log('Username does not existrrrr.' + req.query.mobile);
    var sellerinfo = {};
    var flag = 0;
    var query2 = { mobile:req.query.mobile};

    dbo.collection("seller").find(query2).limit(1).toArray(function(err, result) {
    //dbo.collection("seller").findOne(query2, function(err, result) {
      if (err) throw err;
       if (result.length) {

        flag = 1;
      sellerinfo = {
         name: result[0].name,
         name: result.name,
        cat1: result[0].cat1,
        cat2: result[0].cat2,
        cat3: result[0].cat3,
        province: result[0].province,
         city:result[0].city,
        address: result[0].address,
        id: result[0]._id,
        lat: result[0].lat,
        long: result[0].long,
        mobile: result[0].mobile,
        tell: result[0].tell,
        score: result[0].score
      };
    }
       });

       //--------------
      var query = { mobile:req.query.mobile,smscode:parseInt(req.query.smscode)  };

    dbo.collection("smsinfo").count(query, { limit: 1 })
     .then((count) => {
       if (count > 0) {

           if (flag == 1){
             resultfinal = {
               result: 'OK',
               describe: "کد پیامک مورد تایید است",
               status : "registered",
               sellerinfo: sellerinfo

             };
           }else{

         resultfinal = {
           result: 'OK',
           describe: "کد پیامک مورد تایید است",
           status: "not registered",
           mobile: req.query.mobile,

         };

       }
         //res.json(result);
       } else {
         //console.log('Username does not exist.');
         resultfinal = {
           result: 'Error',
           describe: "کد پیامک اشتباه است",
           mobile: req.query.mobile,

         };

       }
       res.json(resultfinal);
     });

     if (err) throw err;

       db.close();
     });

});
//end of sms verification
//sms user verification
app.get("/smsverifyuser",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
     if (err) throw err;
      var dbo = db.db("omdehchi");
      var resultfinal = {};

    var userinfo = {};
    var flag = 0;
    var query2 = { mobile:req.query.mobile};




       //--------------
      var query = { mobile:req.query.mobile,smscode:parseInt(req.query.smscode)  };

    dbo.collection("smsinfo").count(query, { limit: 1 })
     .then((count) => {
       if (count > 0) {
         dbo.collection("customer").find(query2).limit(1).toArray(function(err, result) {
           if (err) throw err;
            if (result.length) {
           flag = 1;
           userinfo = {

             id: result[0]._id,

             mobile: result[0].mobile,

           };
           resultfinal = {
             result: 'OK',
             describe: "کد پیامک مورد تایید است",
             status : "registered",
             userinfo: userinfo

           };
             res.json(resultfinal);
            db.close();
         }else{
           //register new customer

              autoIncrementmongo.getNextSequence(db, "customer", function (err, autoIndex) {
               var dbo = db.db("omdehchi");
              var myobj = { _id:autoIndex,mobile: req.query.mobile,name:""};


               dbo.collection("customer").insertOne(myobj, function(err, mongoResponse) {
                 if (err) throw err;
                  flag = 0;
                  resultfinal = {
                    result: 'OK',
                    describe: "کد پیامک مورد تایید است",
                   status : "registered",
                    userinfo : {
                      id: autoIndex,
                      mobile: req.query.mobile
                    }
                  };
                       console.log("1 document inserted");
                       res.json(resultfinal);
                      db.close();
              });

              //db.close();
            });

         }
           //db.close();
            });



       } else {

         resultfinal = {
           result: 'Error',
           describe: "کد پیامک اشتباه است",
           mobile: req.query.mobile,

         };
         res.json(resultfinal);
           db.close();
       }
    //db.close();
     });



     });

});

//end of sms user verification
//read province&Cities
app.get("/province",(req,res) => {
let rawdata = fs.readFileSync('../province.json');
let student = JSON.parse(rawdata);
res.send(student)
});
//end of read province&Cities
//connect server
app.listen(port, hostname, function() {
  console.log('Server running at http://'+ hostname + ':' + port + '/');
});

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});*/

//search products
app.get("/search",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
     if (err) throw err;
      var dbo = db.db("omdehchi");
      //var query = { name: req.query.namepdc };
      //var query = {$text: {$search: req.query.namepdc}};

      //dbo.collection("products").find(query).toArray(function(err, result) {
       //if (err) throw err;

       dbo.collection("products").aggregate([
         {$match: {
               $text: {$search: req.query.namepdc}}
         },
        { $lookup:
           {
             from: 'tenders',
             localField: '_id',
             foreignField: 'idpdc',
             as: 'tenders'
           }
         }
        ]).toArray(function(err, result) {
        if (err) throw err;
       //get lifetimetender

         dbo.collection("lifetimetender").findOne({},function(err, lifetimetender1) {
              if (err) throw err;
            var lifetimetender = lifetimetender1;

      res.json({result,nowmicrotime:Date.now(),lifetimetender:lifetimetender});
      db.close();
    });
      });
  });
});
//gateway
app.get("/gateway",(req,res) => {
  res.sendFile(__dirname + '/gateway');
});


//soket io
var tenderSchema = mongoose.Schema({

  idpdc: String,
  idcustomer: String,
  timeCreate: {type: Date, default: Date.now},
  microtime: {type: microtime, default: microtime.now},
  suggestions: {
   //idseller:String,
   //price:String,
   //timesuggest: {type: Date, default: Date.now},
 },
  //suggestions: [suggestion]

})

//autoincrement.initialize(mongoose.connection);
var connection = mongoose.createConnection(url);

autoincrement.initialize(connection);
tenderSchema.plugin(autoincrement.plugin, 'tender');

var tender = connection.model('tender',tenderSchema);

io.sockets.on("connection",function(socket){

        console.log('Client connected...');
        socket.username = ""

      /*suggest.find({},function(err,docs){
          if(err) throw err;
          console.log("sending old suggestions");
          socket.emit('load old suggestions' , docs)
});*/

socket.on('disconnect', function(){
  console.log('user disconnected');
});
socket.on("username", function(username){
  socket.username = username
console.log(username + ' connected');
});

/*socket.on(socket.username, function(data){

console.log(username + ' connected has an accepted suggestion');
  io.socket.emit(data[4] ,  data[0], data[1], data[2],data[3], data[4],data[5]);
});*/

socket.on('acceptsuggestion', function(data){

console.log(data[5] + 'has an accepted suggestion');

  io.emit("customer_" + data[5] ,data[0], data[1], data[2],data[3], data[4],data[5],data[6],data[7],data[8]);
  //set num
  MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("omdehchi");
  var numaccept = "";
  var mobile = "";
  //set suggestion status suggestion

  var myquery1 = { _id: parseInt(data[7]) };
  var newvalues1 = { $set: {status: "accepted"} };
  dbo.collection("suggestions").updateOne(myquery1, newvalues1, function(err, res) {
    if (err) throw err;
    //console.log(myquery1);
    });
   //increase numorder
  var query = { mobile: data[5] };
 dbo.collection("customer").find(query).limit(1).toArray(function(err, result) {
   if (err) throw err;
   numaccept = result[0].numorder;


  var myquery = { mobile: result[0].mobile };

  var newvalues = { $set: {numorder: numaccept+1} };
  dbo.collection("customer").updateOne(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  });
   });
});
//end set num
})
//get new tender from customer
socket.on("newtender" , function(data){

var timeCreate = new Date().toLocaleTimeString(); // 11:18:48 AM
//var dateCreate = jdate.date;
  var datenow = new Date(Date.now()).toLocaleString();
  var dateCreate = moment(datenow,'YYYY-MM-DD').locale('fa').format('YYYY/MM/DD'); // 1367/11/04
 let timecreat = dateCreate + "-" + timeCreate;
 //console.log("ddddffff" + timecreat)
 String.prototype.toFaDigit = function() {
    return this.replace(/\d+/g, function(timecreat) {
        var ret = '';
        for (var i = 0, len = timecreat.length; i < len; i++) {
            ret += String.fromCharCode(timecreat.charCodeAt(i) + 1728);
        }
      //console.log("dddd" + ret)
        return ret;
    });
};
 //var lifetimetender = 10000;
    //console.log('message: ' + dateCreate + " " + timeCreate);
  // console.log("cat tender" + data.cat)

    MongoClient.connect(url, (err, db) => {

    if (err) throw err;
    var dbo = db.db("omdehchi");

    autoIncrementmongo.getNextSequence(db, "tenders", function (err, autoIndex) {
    var pricesuggest = [];

       var myobj = {_id: autoIndex,idpdc:parseInt(data.idpdc),count:data.count,idcustomer:data.idcustomer,cat:data.cat,photo:data.photo,timecreat:timecreat,pricesuggests:pricesuggest,describecustomer:data.decribecustomer,microtimecreate:Date.now(),active:"yes"};


        dbo.collection("tenders").insertOne(myobj, function(err, mongoResponse) {

        console.log("1 tender started");


       });

       io.emit("newtender" + data.cat , data,timecreat,autoIndex);
       //set downcounter timer


       dbo.collection("lifetimetender").findOne({},function(err, lifetimetender1) {
         //dbo.collection("lifetimetender").find({}).limit(1).toArray(function(err, lifetimetender1) {

            if (err) throw err;
          var lifetimetender = lifetimetender1.lifetimetender;

          //console.log("45555v" + lifetimetender);


       setTimeout(function(str1, str2) {
         //io.emit("tenderexpired" , autoIndex);
         var myquery = {_id: autoIndex};
        var newvalues = { $set: {active: "no"} };
         dbo.collection("tenders").updateOne(myquery, newvalues, function(err, res) {
          if (err) throw err;
          console.log("1 document updated");
       //send tender to users
       var query = { _id: autoIndex };

      //dbo.collection("tenders").findOne(query).toArray(function(err, result) {
        dbo.collection("tenders").find(query).limit(1).toArray(function(err, result) {

        if (err) throw err;
        var obj = JSON.stringify(result)

          io.emit("finishtender" + data.idcustomer ,JSON.parse(obj) );
          io.emit("finishtender" + data.cat ,JSON.parse(obj) );
          });
         db.close();

          });
          console.log(str1 + " " + str2);
        }, lifetimetender, "Hello.", "one tender expired");
        });
//----------
     });
         assert.equal(null, err);






    //remove extra tender for product
    var query = { idpdc:data.idpdc };
    
    dbo.collection("tenders").count(query, { limit: 1 })
   .then((count) => {
     if (count > 20) {

       dbo.collection("tenders").deleteOne(query, function(err, obj) {
       if (err) throw err;
       //console.log("1 document deleted");
       db.close();
       //res.json(result);
       });
     }

   });
   });
   //-----------------

  });
//new price suggest from seller

socket.on("newpricesuggest",function(data){
  //console.log("new price suggest" + data.idtender)
  MongoClient.connect(url, (err, db) => {

  if (err) throw err;
  var dbo = db.db("omdehchi");
  var timeCreate = new Date().toLocaleTimeString(); // 11:18:48 AM
  //var dateCreate = jdate.date;
    var datenow = new Date(Date.now()).toLocaleString();
    var dateCreate = moment(datenow,'YYYY-MM-DD').locale('fa').format('YYYY/MM/DD'); // 1367/11/04
   let timecreat = dateCreate + "-" + timeCreate;
      //dbo.collection("seller").insertOne(myobj, function(err, mongoResponse) {
      var query = { "_id": data.idseller};
      //dbo.collection("seller").findOne(query).toArray(function(err, result1) {
          dbo.collection("seller").findOne({}, function(err, result1) {
          //dbo.collection("seller").find(query).limit(1).toArray(function(err, result1) {

       if (err) throw err;

       //console.log("1 document updated by" + result1[0]);
    //send tender to users


      db.collection("tenders").update(
              { "_id": parseInt(data.idtender) },
              //{  "$push": { "pricesuggests": { "$each": [ { wk: 5, score: 8 }] } } },
              {  "$push": { "pricesuggests": { "$each": [{"idtender":data.idtender,"idseller":data.idseller,"sellerinfo":result1,"pricesuggest":data.pricesuggest,timesuggest:timecreat,describeseller:data.describe}] } } },
              { "upsert": true },
              function(err, result) {
                  if (err) {
                     console.log('err:  ' + err);
                  }
                  else {
                    var objsellerinfo = JSON.stringify(result1)

               //io.emit("finishtender" ,JSON.parse(obj) );
                    console.log("new price  rrrrsuggest" + objsellerinfo)
                    io.emit("newpricesuggest" + data.cat , data,timecreat,JSON.parse(objsellerinfo));
                    io.emit("newpricesuggest" + data.idpdc , data,timecreat,JSON.parse(objsellerinfo));
                    //io.emit("newpricesuggest" , data,timecreat,JSON.parse(objsellerinfo));
                      console.log('update result:  ' + result);
                  }
              }
          );


      console.log("1 new price suggest regestered");
      //res.json({'result': 'OK','message': 'register successfully'});
       db.close();


       assert.equal(null, err);

     });
      });
});

//get new inquiry from customer
socket.on("newinquiry" , function(data){

var timeCreate = new Date().toLocaleTimeString(); // 11:18:48 AM
//var dateCreate = jdate.date;
  var datenow = new Date(Date.now()).toLocaleString();
  var dateCreate = moment(datenow,'YYYY-MM-DD').locale('fa').format('YYYY/MM/DD'); // 1367/11/04
 let timecreat = dateCreate + "-" + timeCreate;
 //console.log("ddddffff" + timecreat)
 String.prototype.toFaDigit = function() {
    return this.replace(/\d+/g, function(timecreat) {
        var ret = '';
        for (var i = 0, len = timecreat.length; i < len; i++) {
            ret += String.fromCharCode(timecreat.charCodeAt(i) + 1728);
        }
      //console.log("dddd" + ret)
        return ret;
    });
};
 //var lifetimetender = 10000;
    //console.log('message: ' + dateCreate + " " + timeCreate);
   //console.log("cat tender" + data.count)

    MongoClient.connect(url, (err, db) => {

    if (err) throw err;
    var dbo = db.db("omdehchi");

    autoIncrementmongo.getNextSequence(db, "inquiry", function (err, autoIndex) {
    var pricesuggest = [];

       var myobj = {_id: autoIndex,namepdc:data.namepdc,count:data.count,photo:data.photo,decribecustomer:data.decribecustomer,idcustomer:data.idcustomer,idseller:data.idseller,decribeseller:data.decribeseller,pricesuggest:data.pricesuggest,timesuggest:data.time,sellerresponde:"",newprice:"",timeCreat:timecreat};


        dbo.collection("inquiry").insertOne(myobj, function(err, mongoResponse) {

        console.log("1 tender started");


       });

       io.emit("inquiry" + data.idseller , data,timecreat,autoIndex);
       //set downcounter timer


//----------
     });
         assert.equal(null, err);




       });



  });
  //end of get new inquiry

  //respond of inquiry from seller

  socket.on("respondeinquiry",function(data){

    MongoClient.connect(url, (err, db) => {

    if (err) throw err;
    var dbo = db.db("omdehchi");
    /*var timeCreate = new Date().toLocaleTimeString(); // 11:18:48 AM
    //var dateCreate = jdate.date;
      var datenow = new Date(Date.now()).toLocaleString();
      var dateCreate = moment(datenow,'YYYY-MM-DD').locale('fa').format('YYYY/MM/DD'); // 1367/11/04
     let timecreat = dateCreate + "-" + timeCreate;*/
        //dbo.collection("seller").insertOne(myobj, function(err, mongoResponse) {
        //var query = { "_id": data.idinquiry};
        //dbo.collection("inquiry").findOne(query).toArray(function(err, result1) {
          //dbo.collection("inquiry").findOne({}, function(err, result1) {
         //if (err) throw err;

         var myquery = { _id: parseInt(data.idinquiry)};
         if (data.responde == "yes"){
           //console.log("new price suggest" + data.responde)
               var newvalues = { $set: {sellerresponde: "yes"} };
             }
         if (data.responde == "no"){
                   var newvalues = { $set: {sellerresponde: "no", newprice: data.newprice } };
          }
          dbo.collection("inquiry").updateOne(myquery, newvalues, function(err, res) {

     console.log("1 document updated");  });
     var query = { _id: parseInt(data.idinquiry) };

    dbo.collection("inquiry").find(query).limit(1).toArray(function(err, result) {

      if (err) throw err;
      var obj = JSON.stringify(result)
      console.log("new price  rrrrsuggest" + data.idcustomer)
        io.emit("respondeinquiry" + data.idcustomer ,JSON.parse(obj) );

        });
     db.close();

   //});

        });
  });

})
//end of sockets

//get lifetimetender
app.get("/lifetimetender",(req,res) => {
  MongoClient.connect(url,{ useNewUrlParser: true }, (err, db) => {
   if (err) throw err;
    var dbo = db.db("omdehchi");


    if (err) throw err;
    //var images = [{"تعداد سیم کارت":"دو سیم کارته","تعداد سیم کارت":"دو سیم کارته","تعداد سیم کارت":"دو سیم کارته"};
    var images = [{"specificlbl":"تعداد سیمکارت","specific":"دو سیمکارته"},{"specificlbl":"پردازنده","specific":"هشت هسته ای"},{"specificlbl":"صفحه نمایش","specific":"۶ اینچی"}]
    //images.push("/images/" + filename);
    //res.json(result);
    var myquery = { "_id": 3 };
      var newvalues = { $set: {cat2: "2" } };
      dbo.collection("seller").updateOne(myquery, newvalues, function(err, res) {
      //dbo.collection("products").update({}, newvalues, function(err, res) {
        //Property.update({}, {'$set': {'numberOfViewsPerWeek' : 0}}, {multi: true},

      //  });
      //dbo.collection("products").deleteMany(myquery, function(err, obj) {
    //if (err) throw err;
    //console.log(obj.result.n + " document(s) deleted");

    db.close();
  });
  });

});
//---------------------------
server.listen(8080, function(){
  console.log('listening on *:8080');

});
