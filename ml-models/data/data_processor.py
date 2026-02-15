import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json

class DataProcessor:
    """Process and prepare data for ML models"""
    
    @staticmethod
    def load_interactions_data(mongodb_connection):
        """Load user interactions from MongoDB"""
        interactions = list(mongodb_connection.user_interactions.find())
        df = pd.DataFrame(interactions)
        return df
    
    @staticmethod
    def load_transactions_data(mongodb_connection):
        """Load transaction/order data from MongoDB"""
        orders = list(mongodb_connection.orders.find())
        return orders
    
    @staticmethod
    def load_products_data(mongodb_connection):
        """Load product data from MongoDB"""
        products = list(mongodb_connection.products.find())
        df = pd.DataFrame(products)
        return df
    
    @staticmethod
    def prepare_interaction_matrix(interactions_df):
        """Convert interactions to matrix format"""
        pivot_table = interactions_df.pivot_table(
            index='userId',
            columns='productId',
            values='interactionType',
            fill_value=0,
            aggfunc='count'
        )
        return pivot_table
    
    @staticmethod
    def prepare_transaction_matrix(orders):
        """Prepare transaction data for frequently bought together analysis"""
        transactions = []
        for order in orders:
            items = [item.get('productId') for item in order.get('items', [])]
            if items:
                transactions.append({
                    'orderId': order.get('_id'),
                    'items': items,
                    'date': order.get('orderDate')
                })
        return transactions
    
    @staticmethod
    def extract_trending_products(interactions_df, days=7):
        """Extract trending products from recent interactions"""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent = interactions_df[interactions_df['timestamp'] > cutoff_date]
        
        product_scores = recent.groupby('productId').agg({
            'interactionType': 'count'
        }).rename(columns={'interactionType': 'score'})
        
        return product_scores.sort_values('score', ascending=False)
    
    @staticmethod
    def feature_scaling(df, features):
        """Scale numerical features"""
        from sklearn.preprocessing import StandardScaler
        scaler = StandardScaler()
        df[features] = scaler.fit_transform(df[features])
        return df, scaler
    
    @staticmethod
    def handle_missing_values(df, strategy='mean'):
        """Handle missing values in dataset"""
        if strategy == 'mean':
            return df.fillna(df.mean())
        elif strategy == 'median':
            return df.fillna(df.median())
        elif strategy == 'drop':
            return df.dropna()
        return df
