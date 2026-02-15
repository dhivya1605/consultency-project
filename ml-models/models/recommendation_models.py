import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD
import pickle

class ProductRecommender:
    """Recommendation model for products"""
    
    def __init__(self):
        self.user_product_matrix = None
        self.product_features = None
        self.scaler = StandardScaler()
        self.svd_model = None
        self.product_similarity = None
    
    def train(self, interactions_df, products_df):
        """Train the recommendation model"""
        # Build user-product interaction matrix
        self.user_product_matrix = interactions_df.pivot_table(
            index='userId',
            columns='productId',
            values='interactionType',
            fill_value=0,
            aggfunc='count'
        )
        
        # Extract product features
        self.product_features = products_df[['price', 'rating', 'purchaseCount', 'viewCount']]
        self.product_features = self.scaler.fit_transform(self.product_features)
        
        # Calculate product similarity matrix
        self.product_similarity = cosine_similarity(self.product_features)
        
        # Apply SVD for dimensionality reduction
        self.svd_model = TruncatedSVD(n_components=10)
        self.svd_model.fit(self.user_product_matrix)
    
    def recommend_for_user(self, user_id, user_interactions, n_recommendations=10):
        """Get personalized recommendations for a user"""
        # Find similar users
        similar_users = self.find_similar_users(user_interactions)
        
        # Get products liked by similar users but not by current user
        recommendations = {}
        for similar_user_id in similar_users:
            # Get their liked products
            liked_products = self.user_product_matrix.loc[similar_user_id][
                self.user_product_matrix.loc[similar_user_id] > 0
            ].index.tolist()
            
            # Add to recommendations if not already liked by user
            for product_id in liked_products:
                if product_id not in user_interactions:
                    recommendations[product_id] = recommendations.get(product_id, 0) + 1
        
        # Return top N recommendations
        sorted_recs = sorted(recommendations.items(), key=lambda x: x[1], reverse=True)
        return [pid for pid, count in sorted_recs[:n_recommendations]]
    
    def find_similar_users(self, user_interactions):
        """Find users with similar preferences"""
        if not self.user_product_matrix is not None:
            return []
        
        # Calculate similarity based on shared products
        similar_users = []
        for user_id in self.user_product_matrix.index:
            intersection = len(set(user_interactions) & set(
                self.user_product_matrix.loc[user_id][
                    self.user_product_matrix.loc[user_id] > 0
                ].index.tolist()
            ))
            if intersection > 0:
                similar_users.append(user_id)
        
        return similar_users[:10]
    
    def save_model(self, filepath):
        """Save trained model"""
        with open(filepath, 'wb') as f:
            pickle.dump(self, f)
    
    @staticmethod
    def load_model(filepath):
        """Load trained model"""
        with open(filepath, 'rb') as f:
            return pickle.load(f)

class FrequentlyBoughtTogether:
    """Model to identify frequently bought together products"""
    
    def __init__(self):
        self.product_pairs = {}
        self.pair_strength = {}
    
    def train(self, transactions):
        """Train on transaction data"""
        for transaction in transactions:
            items = transaction.get('items', [])
            # Create product pairs
            for i, item1 in enumerate(items):
                for item2 in items[i+1:]:
                    pair = tuple(sorted([item1, item2]))
                    self.product_pairs[pair] = self.product_pairs.get(pair, 0) + 1
        
        # Normalize pair strengths
        max_count = max(self.product_pairs.values()) if self.product_pairs else 1
        self.pair_strength = {
            pair: count / max_count 
            for pair, count in self.product_pairs.items()
        }
    
    def recommend(self, product_id, n_recommendations=5):
        """Get frequently bought together recommendations"""
        related_products = {}
        
        for pair, strength in self.pair_strength.items():
            if product_id in pair:
                other_product = pair[1] if pair[0] == product_id else pair[0]
                related_products[other_product] = strength
        
        # Return top N
        sorted_recs = sorted(related_products.items(), key=lambda x: x[1], reverse=True)
        return [pid for pid, strength in sorted_recs[:n_recommendations]]
