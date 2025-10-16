from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///toilet.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Model
class ToiletStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    is_occupied = db.Column(db.Boolean, default=False)
    current_user = db.Column(db.String(100), nullable=True)
    check_in_time = db.Column(db.DateTime, nullable=True)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'is_occupied': self.is_occupied,
            'current_user': self.current_user,
            'check_in_time': self.check_in_time.isoformat() if self.check_in_time else None,
            'last_updated': self.last_updated.isoformat(),
            'duration_minutes': self.get_duration_minutes()
        }
    
    def get_duration_minutes(self):
        if self.is_occupied and self.check_in_time:
            duration = datetime.utcnow() - self.check_in_time
            return int(duration.total_seconds() / 60)
        return 0

# Initialize database
with app.app_context():
    db.create_all()
    # Create initial status if doesn't exist
    if ToiletStatus.query.first() is None:
        initial_status = ToiletStatus(is_occupied=False)
        db.session.add(initial_status)
        db.session.commit()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current toilet status"""
    status = ToiletStatus.query.first()
    
    # Auto check-out after 30 minutes
    if status.is_occupied and status.check_in_time:
        if datetime.utcnow() - status.check_in_time > timedelta(minutes=30):
            status.is_occupied = False
            status.current_user = None
            status.check_in_time = None
            status.last_updated = datetime.utcnow()
            db.session.commit()
    
    return jsonify(status.to_dict())

@app.route('/api/checkin', methods=['POST'])
def check_in():
    """Check in to toilet"""
    data = request.json
    user_name = data.get('user_name', 'Anonymous')
    
    status = ToiletStatus.query.first()
    
    if status.is_occupied:
        return jsonify({'error': 'Toilet is already occupied'}), 400
    
    status.is_occupied = True
    status.current_user = user_name
    status.check_in_time = datetime.utcnow()
    status.last_updated = datetime.utcnow()
    db.session.commit()
    
    return jsonify(status.to_dict())

@app.route('/api/checkout', methods=['POST'])
def check_out():
    """Check out from toilet"""
    status = ToiletStatus.query.first()
    
    status.is_occupied = False
    status.current_user = None
    status.check_in_time = None
    status.last_updated = datetime.utcnow()
    db.session.commit()
    
    return jsonify(status.to_dict())

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
