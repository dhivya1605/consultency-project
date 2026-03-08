# 🔐 Cloudinary Credentials & Configuration

## Your Cloudinary Account Details

```
Cloud Name:  dveuwbzhb
API Key:     175534293749868
API Secret:  fkKH6SFljxCTzHY-GiboTVknA0Q
```

## Backend Environment Variables

**File**: `backend/.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/electronic
JWT_SECRET=your_secure_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
ML_API_URL=http://localhost:8000
CLOUD_NAME=dveuwbzhb
API_KEY=175534293749868
API_SECRET=fkKH6SFljxCTzHY-GiboTVknA0Q
```

## Cloudinary Dashboard Access

**Login**: https://cloudinary.com/console
- Cloud Name: `dveuwbzhb`
- Verify credentials there

## Configuration Files Created

### 1. config/cloudinary.js
```javascript
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports = cloudinary;
```

### 2. middleware/upload.js
```javascript
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    resource_type: "auto",
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
```

## How to Use in Routes

**In productRoutes.js**:
```javascript
const upload = require('../middleware/upload');

router.post('/', authMiddleware, adminMiddleware, upload.single('image'), createProduct);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), updateProduct);
```

## How to Use in Controller

**In productController.js**:
```javascript
const createProduct = async (req, res) => {
  const imageUrl = req.file ? req.file.path : req.body.image;
  
  const product = new Product({
    name: req.body.name,
    image: imageUrl,  // Cloudinary URL
    // ... other fields
  });

  await product.save();
};
```

## API Endpoints Updated

### POST /api/products (Create Product)
- Accepts: multipart/form-data
- Image field: `image` (file upload)
- Returns: Cloudinary URL in product.image

### PUT /api/products/:id (Update Product)
- Accepts: multipart/form-data
- Image field: `image` (file upload, optional)
- Returns: Updated product with Cloudinary URL

### GET /api/products (Get All Products)
- Returns: Product objects with image: "https://res.cloudinary.com/..."

## Frontend Usage

No changes needed! Components already compatible:

```javascript
// In React components
<img src={product.image} alt={product.name} />
// product.image is now a full Cloudinary URL
// Example: "https://res.cloudinary.com/dveuwbzhb/image/upload/v123456/products/abc123.jpg"
```

## Testing Credentials Verification

```bash
# Test backend loads credentials
npm run dev
# Check console output for any env var errors

# Test Cloudinary connection
# Try uploading a product from admin dashboard
# Check Cloudinary dashboard Media Library → products folder
```

---

## Security Notes

⚠️ **Important**: 
- .env file should NEVER be committed to git
- Add `.env` to `.gitignore` if not already done
- For production: use environment variables from hosting platform
- Consider: Restrict API key to upload-only permissions in Cloudinary

---

## Reference Links

- Cloudinary Console: https://cloudinary.com/console
- Cloudinary Node.js SDK: https://cloudinary.com/documentation/node_integration
- Multer-Storage-Cloudinary: https://github.com/afuh/multer-storage-cloudinary

