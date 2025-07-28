const multer = require('multer');
const path = require('path');

// Set up storage engine for Multer to save files locally
const storage = multer.diskStorage({
    // The destination folder on your server where uploads will be stored.
    // You must create the 'public' and 'uploads' folders in your backend's root directory.
    destination: './public/uploads/',
    
    // The logic for naming the uploaded files to ensure they are unique.
    filename: function(req, file, cb){
        // Creates a unique filename: original_fieldname-timestamp.extension
        // e.g., productImage-1678886400000.png
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize the upload middleware with the new local storage configuration
const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // Limit file size to 2MB
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
    // '.single('productImage')' specifies that we are expecting a single file from a form field named 'productImage'
}).single('productImage'); 

// Function to check that only image files are uploaded
function checkFileType(file, cb){
    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check the file extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check the mime type (e.g., image/jpeg)
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        // If the file is not an image, pass an error
        cb('Error: You can upload images only!');
    }
}

module.exports = upload;
