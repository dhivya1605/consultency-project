from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def prepare_data(sales_data):
    """
    Converts raw order data into a monthly time-series for training.
    """
    if not sales_data:
        return None
    
    # Convert to DataFrame
    df = pd.DataFrame(sales_data)
    
    # Convert orderDate to datetime
    df['orderDate'] = pd.to_datetime(df['orderDate'])
    
    # Group by month and year, sum totalAmount
    df['month_year'] = df['orderDate'].dt.to_period('M')
    monthly_sales = df.groupby('month_year')['totalAmount'].sum().reset_index()
    
    # Sort by date
    monthly_sales = monthly_sales.sort_values('month_year')
    
    # Create numeric representation of months for regression (e.g., 1, 2, 3...)
    monthly_sales['month_index'] = range(1, len(monthly_sales) + 1)
    
    return monthly_sales

@app.route('/api/sales-prediction', methods=['POST'])
def predict_sales():
    try:
        data = request.json
        sales_data = data.get('salesData', [])
        
        if len(sales_data) < 2:
            # Not enough data to train a trend
            return jsonify({
                "prediction": 0,
                "confidence": 0,
                "trend": "stable",
                "message": "Insufficient data for prediction"
            })
        
        # Prepare the dataset
        monthly_df = prepare_data(sales_data)
        
        # If we have only one month, analyze daily trend within that month
        if len(monthly_df) < 2:
            df = pd.DataFrame(sales_data)
            df['orderDate'] = pd.to_datetime(df['orderDate'])
            # Group by day index
            df['day_index'] = (df['orderDate'] - df['orderDate'].min()).dt.days
            daily_sales = df.groupby('day_index')['totalAmount'].sum().reset_index()
            
            if len(daily_sales) > 1:
                X_daily = daily_sales[['day_index']].values
                y_daily = daily_sales['totalAmount'].values
                daily_model = LinearRegression().fit(X_daily, y_daily)
                
                # Predict total for next 30 days
                last_day = daily_sales['day_index'].max()
                future_days = np.array([[i] for i in range(last_day + 1, last_day + 31)])
                predicted_daily = daily_model.predict(future_days)
                prediction = float(np.sum(np.maximum(0, predicted_daily)))
                
                slope = daily_model.coef_[0]
                trend = "upward" if slope > 0 else "downward"
                confidence = 0.65 # Lower confidence for intra-month extrapolation
            else:
                # Absolute minimal data - use a conservative fallback
                prediction = monthly_df['totalAmount'].iloc[0] * 1.12
                trend = "upward"
                confidence = 0.5
                
            logger.info(f"Daily-based prediction made: {prediction}, Trend: {trend}")
            
        else:
            # Standard multi-month regression
            X = monthly_df[['month_index']].values
            y = monthly_df['totalAmount'].values
            
            model = LinearRegression().fit(X, y)
            prediction = float(max(0, model.predict([[len(monthly_df) + 1]])[0]))
            
            slope = model.coef_[0]
            trend = "upward" if slope > 0 else "downward"
            confidence = max(0.6, min(0.95, float(model.score(X, y))))
            
            logger.info(f"Monthly Sales Data:\n{monthly_df[['month_year', 'totalAmount']].to_string()}")
            logger.info(f"Monthly-based prediction: {prediction}, Confidence: {confidence}")
        
        return jsonify({
            "prediction": prediction,
            "confidence": confidence,
            "trend": trend,
            "historical_months": len(monthly_df)
        })

    except Exception as e:
        logger.error(f"Error in prediction: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=8000, debug=True)
