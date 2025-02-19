const multer = require('multer');
const path = require('path');

var storage = multer.diskStorage({   
    destination: function(req, file, cb) { 
    // destination is used to specify the path of the directory in which the files have to be stored
    cb(null, './uploads');    
  }, 
  filename: function (req, file, cb) { 
// It is the filename that is given to the saved file.
     cb(null , file.originalname);   
  }
});

  exports.upload = multer({ storage });
  