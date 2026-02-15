from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize recommendation models
class RecommendationEngine:
    def __init__(self):
        self.user_product_matrix = None
        self.product_similarity = None
        self.scaler = StandardScaler()

    def build_user_product_matrix(self, interactions):
        """Build user-product interaction matrix from user interactions"""
        if not interactions:
            return None
        
        df = pd.DataFrame(interactions)
        user_product_matrix = df.pivot_table(
            index='userId',
            columns='productId',
            values='interactionType',
            fill_value=0
        )
        return user_product_matrix

    def calculate_product_similarity(self, products):
        """Calculate similarity between products using features"""
        if not products:
            return None
        
        
        features = []
        for product in products:
            feature_vector = [
                product.get('price', 0),
                product.get('rating', 0),
                product.get('purchaseCount', 0),
                product.get('viewCount', 0),
                1 if product.get('isTrending') else 0
            ]
            features.append(feature_vector)
        
        features_normalized = self.scaler.fit_transform(features)
        similarity = cosine_similarity(features_normalized)
        return similarity

    def recommend_based_on_history(self, user_products, all_products, limit=10):
        """Recommend products based on user purchase history"""
        if not user_products or not all_products:
            return []
        
        
        user_product_ids = set(user_products)
        candidate_products = [p for p in all_products if p['_id'] not in user_product_ids]
        
       
        scores = {}
        for candidate in candidate_products:
            score = 0
            for purchased_id in user_product_ids:
                purchased = next((p for p in all_products if p['_id'] == purchased_id), None)
                if purchased:
                    score += self.similarity_score(candidate, purchased)
            scores[candidate['_id']] = score / len(user_product_ids) if user_product_ids else 0
        
        # Return top products
        sorted_products = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [pid for pid, score in sorted_products[:limit]]

    def similarity_score(self, product1, product2):
        """Calculate similarity between two products"""
        category_match = 1 if product1.get('category') == product2.get('category') else 0.5
        price_diff = 1 - (abs(product1.get('price', 0) - product2.get('price', 0)) / max(
            product1.get('price', 1), product2.get('price', 1)
        ))
        return (category_match + price_diff) / 2

recommendation_engine = RecommendationEngine()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML API is running'})

@app.route('/api/recommend', methods=['POST'])
def get_recommendations():
    """Get personalized recommendations for a user"""
    try:
        data = request.json
        user_id = data.get('userId')
        purchased_products = data.get('purchasedProducts', [])
        viewed_products = data.get('viewedProducts', [])
        limit = int(data.get('limit', 10))

        
        user_interactions = list(set(purchased_products + viewed_products))

        
        recommendations = user_interactions[:limit] if user_interactions else []

        return jsonify({
            'recommendations': recommendations,
            'userId': user_id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/frequently-bought', methods=['POST'])
def get_frequently_bought():
    """Get frequently bought together products"""
    try:
        data = request.json
        product_id = data.get('productId')
        transactions = data.get('transactions', [])
        limit = int(data.get('limit', 5))

        # Find products frequently bought with this product
        product_pairs = {}
        for transaction in transactions:
            items = transaction.get('items', [])
            if product_id in items:
                for item in items:
                    if item != product_id:
                        product_pairs[item] = product_pairs.get(item, 0) + 1

        # Sort and return top products
        sorted_products = sorted(product_pairs.items(), key=lambda x: x[1], reverse=True)
        recommendations = [pid for pid, count in sorted_products[:limit]]

        return jsonify({
            'frequently_bought_together': recommendations,
            'productId': product_id
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trending', methods=['POST'])
def get_trending_products():
    """Get trending products based on recent activity"""
    try:
        data = request.json
        activities = data.get('activities', [])
        limit = int(data.get('limit', 10))

        # Score products by recent view and purchase counts
        product_scores = {}
        for activity in activities:
            product_id = activity.get('productId')
            activity_type = activity.get('type', 'view')
            weight = 3 if activity_type == 'purchase' else 1
            
            product_scores[product_id] = product_scores.get(product_id, 0) + weight

        # Return top trending products
        sorted_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
        trending = [pid for pid, score in sorted_products[:limit]]

        return jsonify({
            'trending_products': trending
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sales-prediction', methods=['POST'])
def predict_sales():
    """Predict next month sales based on current data"""
    try:
        data = request.json
        sales_data = data.get('salesData', [])
        
        if not sales_data:
            return jsonify({'prediction': 0, 'confidence': 0})
        
        # Simple linear trend prediction
        amounts = [item.get('totalAmount', 0) for item in sales_data]
        if len(amounts) < 2:
            prediction = amounts[0] * 1.15 if amounts else 0  # 15% growth assumption
        else:
            # Calculate trend
            recent_avg = sum(amounts[-3:]) / min(3, len(amounts))
            overall_avg = sum(amounts) / len(amounts)
            growth_rate = (recent_avg / overall_avg) if overall_avg > 0 else 1.15
            prediction = recent_avg * growth_rate
        
        return jsonify({
            'prediction': round(prediction, 2),
            'confidence': 0.75,
            'trend': 'upward' if prediction > (sum(amounts) / len(amounts) if amounts else 0) else 'downward'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sales-chart', methods=['POST'])
def get_sales_chart():
    """Generate sales chart data"""
    try:
        data = request.json
        sales_data = data.get('salesData', [])
        
        # Process sales data for chart
        chart_data = []
        product_sales = {}
        
        for sale in sales_data:
            for item in sale.get('items', []):
                product_name = item.get('name', 'Unknown')
                amount = item.get('totalAmount', 0) if 'totalAmount' in item else item.get('price', 0) * item.get('quantity', 1)
                product_sales[product_name] = product_sales.get(product_name, 0) + amount
        
        # Sort by sales amount
        sorted_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)
        
        for product, amount in sorted_products[:10]:  # Top 10 products
            chart_data.append({
                'product': product,
                'sales': amount,
                'percentage': round((amount / sum(product_sales.values())) * 100, 1) if product_sales else 0
            })
        
        return jsonify({
            'chartData': chart_data,
            'totalProducts': len(product_sales),
            'topProduct': sorted_products[0] if sorted_products else None
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
