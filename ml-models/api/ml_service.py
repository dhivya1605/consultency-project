from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns
import base64
import io
from datetime import datetime, timedelta
import pymongo
from bson import ObjectId
import os

app = Flask(__name__)
CORS(app)

# MongoDB connection
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/electronic')
client = pymongo.MongoClient(MONGO_URI)
db = client.ecommerce

@app.route('/api/sales-prediction', methods=['GET'])
def predict_sales():
    try:
        # Get sales data from MongoDB
        orders = list(db.orders.find({}))
        
        if not orders:
            return jsonify({'error': 'No sales data available'}), 400
        
      
        df = pd.DataFrame(orders)
        df['orderDate'] = pd.to_datetime(df['orderDate'])
        df['month'] = df['orderDate'].dt.to_period('M')
        
       
        monthly_sales = df.groupby('month')['totalAmount'].sum().reset_index()
        monthly_sales['month_num'] = range(len(monthly_sales))
        
        if len(monthly_sales) < 2:
            return jsonify({'error': 'Need at least 2 months of data'}), 400
        
        
        X = monthly_sales[['month_num']].values
        y = monthly_sales['totalAmount'].values
        
        
        model = LinearRegression()
        model.fit(X, y)
        
       
        next_month = len(monthly_sales)
        prediction = model.predict([[next_month]])[0]
        
      
        trend = 'increasing' if model.coef_[0] > 0 else 'decreasing'
        
        return jsonify({
            'prediction': float(prediction),
            'trend': trend,
            'confidence': 0.85,  # Mock confidence score
            'current_month_sales': float(monthly_sales['totalAmount'].iloc[-1]),
            'growth_rate': float((prediction - monthly_sales['totalAmount'].iloc[-1]) / monthly_sales['totalAmount'].iloc[-1] * 100)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sales-chart', methods=['GET'])
def generate_sales_chart():
    try:
        
        orders = list(db.orders.find({}))
        
        if not orders:
            return jsonify({'error': 'No sales data available'}), 400
        
        
        df = pd.DataFrame(orders)
        df['orderDate'] = pd.to_datetime(df['orderDate'])
        df['month'] = df['orderDate'].dt.to_period('M')
        
       
        monthly_sales = df.groupby('month')['totalAmount'].sum()
        
        
        plt.figure(figsize=(12, 6))
        plt.plot(range(len(monthly_sales)), monthly_sales.values, marker='o', linewidth=2, markersize=8)
        plt.title('Monthly Sales Trend', fontsize=16, fontweight='bold')
        plt.xlabel('Month', fontsize=12)
        plt.ylabel('Sales Amount', fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.xticks(range(len(monthly_sales)), [str(m) for m in monthly_sales.index], rotation=45)
        
       
        x_vals = np.array(range(len(monthly_sales)))
        z = np.polyfit(x_vals, monthly_sales.values, 1)
        p = np.poly1d(z)
        plt.plot(x_vals, p(x_vals), "--", alpha=0.8, color='red', label='Trend')
        plt.legend()
        
        plt.tight_layout()
        
        
        img = io.BytesIO()
        plt.savefig(img, format='png', dpi=150, bbox_inches='tight')
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()
        plt.close()
        
        return jsonify({
            'chart': f'data:image/png;base64,{plot_url}',
            'monthly_data': [{'month': str(m), 'sales': float(s)} for m, s in monthly_sales.items()]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/product-analysis', methods=['GET'])
def product_analysis():
    try:
        # Get order data with items
        orders = list(db.orders.find({}))
        
        if not orders:
            return jsonify({'error': 'No data available'}), 400
        
        # Extract product sales
        product_sales = {}
        for order in orders:
            for item in order.get('items', []):
                name = item.get('name', 'Unknown')
                amount = item.get('price', 0) * item.get('quantity', 0)
                product_sales[name] = product_sales.get(name, 0) + amount
        
        # Create product performance chart
        products = list(product_sales.keys())[:10]  # Top 10
        sales = [product_sales[p] for p in products]
        
        plt.figure(figsize=(12, 8))
        bars = plt.bar(range(len(products)), sales, color='skyblue', edgecolor='navy', alpha=0.7)
        plt.title('Top 10 Products by Sales', fontsize=16, fontweight='bold')
        plt.xlabel('Products', fontsize=12)
        plt.ylabel('Sales Amount', fontsize=12)
        plt.xticks(range(len(products)), products, rotation=45, ha='right')
        
        # Add value labels on bars
        for bar, value in zip(bars, sales):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(sales)*0.01,
                    f'${value:.0f}', ha='center', va='bottom', fontweight='bold')
        
        plt.tight_layout()
        
        # Convert to base64
        img = io.BytesIO()
        plt.savefig(img, format='png', dpi=150, bbox_inches='tight')
        img.seek(0)
        plot_url = base64.b64encode(img.getvalue()).decode()
        plt.close()
        
        return jsonify({
            'chart': f'data:image/png;base64,{plot_url}',
            'top_products': [{'name': p, 'sales': float(product_sales[p])} for p in products]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)