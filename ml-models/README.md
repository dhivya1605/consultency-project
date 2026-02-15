# ML Models Documentation

## Overview
This folder contains the machine learning models for the e-commerce recommendation system.

## Components

### 1. Recommendation Engine (`api/app.py`)
Flask-based API server that provides:
- **Personalized Recommendations**: Based on user purchase and browsing history
- **Frequently Bought Together**: Products commonly purchased together
- **Trending Products**: Popular items based on recent activity

### 2. Recommendation Models (`models/recommendation_models.py`)
Includes:
- **ProductRecommender**: Collaborative filtering-based recommendations
- **FrequentlyBoughtTogether**: Association rule mining for product pairs

### 3. Data Processor (`data/data_processor.py`)
Handles:
- Data loading from MongoDB
- Feature extraction and preprocessing
- Matrix preparation for ML algorithms
- Trending product identification

## ML Models Explanation

### Collaborative Filtering
Recommends products based on:
- Similar users' preferences
- User's own purchase history
- Product interaction patterns

### Content-Based Filtering
Uses product features:
- Price
- Rating
- Category
- Purchase count
- View count

### Frequently Bought Together
Uses association rules to identify:
- Product pairs bought in same transaction
- Co-occurrence strength
- Recommendations during checkout

## Setup and Running

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the ML API:
```bash
python api/app.py
```

The API will start on `http://localhost:8000`

## API Endpoints

### GET /health
Check if the ML API is running

### POST /api/recommend
Get personalized recommendations
- Input: userId, purchasedProducts, viewedProducts, limit
- Output: List of recommended product IDs

### POST /api/frequently-bought
Get frequently bought together products
- Input: productId, transactions, limit
- Output: List of related product IDs

### POST /api/trending
Get trending products
- Input: activities, limit
- Output: List of trending product IDs

## Model Training

To train models with real data:

```python
from models.recommendation_models import ProductRecommender
from data.data_processor import DataProcessor
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017')
db = client['ecommerce']

# Load data
interactions = DataProcessor.load_interactions_data(db)
products = DataProcessor.load_products_data(db)

# Train model
recommender = ProductRecommender()
recommender.train(interactions, products)

# Save model
recommender.save_model('models/recommender_model.pkl')
```

## Integration with Backend

The backend calls the ML API at:
```
POST http://localhost:8000/api/recommend
```

The recommendation controller automatically falls back to database queries if the ML API is unavailable.
