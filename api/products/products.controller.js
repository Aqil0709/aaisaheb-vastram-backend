// backend/controllers/productController.js
const db = require('../../config/db');

// --- PUBLIC ---
const getAllProducts = async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
        // The 'images' column is stored as a JSON string, so we need to parse it.
        const parsedProducts = products.map(p => ({...p, images: JSON.parse(p.images)}));
        res.status(200).json(parsedProducts);
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: 'Server error while fetching products.' });
    }
};

// --- NEW FUNCTION: Get product by ID ---
const getProductById = async (req, res) => {
    const { productId } = req.params; // Get product ID from URL parameter
    try {
        const [product] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }
        // Assuming images are stored as a JSON string, parse it
        const parsedProduct = {
            ...product[0],
            images: JSON.parse(product[0].images)
        };
        // For the frontend, we typically only need the first image URL for display
        // You might want to return `imageUrl` directly or `images[0]`
        parsedProduct.imageUrl = parsedProduct.images[0] || ''; // Add a single imageUrl for convenience
        res.status(200).json(parsedProduct);
    } catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({ message: 'Server error while fetching product by ID.' });
    }
};


const addProduct = async (req, res) => {
    const { name, category, price, originalPrice, description } = req.body;
    
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: 'Product image is required.' });
    }

    // --- UPDATED FOR HOSTINGER ---
    // Instead of a full path from Cloudinary, multer now gives us a filename.
    // We construct the full public URL for the image on your server.
    const imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
    const imagesJson = JSON.stringify([imageUrl]); // Store it in your database

    try {
        const sql = `
            INSERT INTO products (name, category, price, description, images, originalPrice )
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await db.query(sql, [name, category, price, description, imagesJson, originalPrice ]);
        
        // Construct the full response body
        const newProduct = {
            id: result.insertId,
            name,
            category,
            price: parseFloat(price),
            originalPrice: parseFloat(originalPrice),
            description,
            images: [imageUrl],
            imageUrl: imageUrl // Also provide single imageUrl for consistency
        };

        res.status(201).json(newProduct);

    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ message: 'Server error while adding product.' });
    }
};

// --- ADMIN ONLY (NEW FUNCTION) ---
const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, category, price, originalPrice, description } = req.body;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required for update.' });
    }

    try {
        let imageUrl = '';
        // Check if a new file was uploaded
        if (req.file) {
            // --- UPDATED FOR HOSTINGER ---
            // If a new file was uploaded, construct its public URL
            imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
        } else {
            // If no new file, fetch the current image from the database to keep it
            const [currentProduct] = await db.query('SELECT images FROM products WHERE id = ?', [productId]);
            if (currentProduct.length > 0) {
                const existingImages = JSON.parse(currentProduct[0].images);
                imageUrl = existingImages[0] || ''; // Keep the existing first image
            }
        }

        const imagesJson = JSON.stringify([imageUrl]);

        const sql = `
            UPDATE products
            SET name = ?, category = ?, price = ?, description = ?, images = ?, originalPrice = ?
            WHERE id = ?
        `;
        
        const [result] = await db.query(sql, [name, category, price, description, imagesJson, originalPrice, productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found for update.' });
        }

        const updatedProduct = {
            id: productId,
            name,
            category,
            price: parseFloat(price),
            originalPrice: parseFloat(originalPrice),
            description,
            images: [imageUrl],
            imageUrl: imageUrl
        };

        res.status(200).json(updatedProduct);

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ message: 'Server error while updating product.' });
    }
};


const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required.' });
    }

    try {
        const sql = 'DELETE FROM products WHERE id = ?';
        const [result] = await db.query(sql, [productId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.status(200).json({ message: 'Product deleted successfully.' });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ message: 'Server error while deleting product.' });
    }
};

// Ensure all functions are exported correctly as an object
module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};
