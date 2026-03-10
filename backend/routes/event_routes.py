import cv2
import numpy as np
import insightface
from pymongo import MongoClient
from datetime import datetime
import os
from flask import Blueprint, request, jsonify
from dotenv import load_dotenv
from numpy.linalg import norm

load_dotenv()

# --------------------------------------------------
# BLUEPRINT
# --------------------------------------------------
event_bp = Blueprint(
    "event_bp",
    __name__,
    url_prefix="/api/event"
)

# --------------------------------------------------
# CONFIG
# --------------------------------------------------
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["AttendanceDB"]
participants_col = db["events_participants"]
attendance_col = db["events_attendance"]

CTX_ID = -1  # CPU mode
ARC_THRESHOLD = 0.38

# --------------------------------------------------
# MODEL (Load once)
# --------------------------------------------------
print("Loading model for Events feature...")
model = insightface.app.FaceAnalysis(name="buffalo_l")
model.prepare(ctx_id=CTX_ID, det_size=(640, 640))

# --------------------------------------------------
# UTILS
# --------------------------------------------------
def get_embedding(img):
    faces = model.get(img)
    if len(faces) == 0:
        return None, "No face detected"
    if len(faces) > 1:
        return None, "Multiple faces detected"
    
    emb = faces[0].embedding
    emb = emb / norm(emb)
    return emb, None

# --------------------------------------------------
# ROUTES
# --------------------------------------------------

@event_bp.route("/register", methods=["POST"])
def register_participant():
    try:
        name = request.form.get("name")
        photo = request.files.get("photo")

        if not name or not photo:
            return jsonify({"error": "Missing name or photo"}), 400

        # Read Image
        img_bytes = photo.read()
        np_img = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Invalid image file"}), 400

        # Get Encoding
        embedding, error = get_embedding(img)
        if error:
            return jsonify({"error": error}), 400

        # Save to DB
        doc = {
            "name": name,
            "face_encoding": embedding.tolist(),
            "registeredAt": datetime.utcnow()
        }
        participants_col.insert_one(doc)

        return jsonify({"message": f"Successfully registered {name}"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@event_bp.route("/recognize", methods=["POST"])
def recognize_participant():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files['image']
        img_bytes = file.read()
        np_img = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Invalid image format"}), 400

        # Detect faces in frame
        faces = model.get(frame)
        if not faces:
            return jsonify({"matches": []}), 200

        # Load known participants
        participants = list(participants_col.find({}))
        if not participants:
            return jsonify({"matches": [], "message": "No registered participants"}), 200

        known_names = [p["name"] for p in participants]
        known_encodings = np.stack([np.array(p["face_encoding"]) for p in participants])

        matches = []
        for face in faces:
            emb = face.embedding
            emb = emb / norm(emb)

            sims = np.dot(emb, known_encodings.T)
            best_idx = np.argmax(sims)
            max_sim = sims[best_idx]

            if max_sim >= ARC_THRESHOLD:
                name = known_names[best_idx]
                matches.append({
                    "name": name,
                    "confidence": float(max_sim),
                    "bbox": face.bbox.astype(int).tolist()
                })
                
                # Log attendance if highly confident
                if max_sim > 0.45:
                    attendance_col.update_one(
                        {"name": name},
                        {"$set": {"lastSeen": datetime.utcnow()}, "$inc": {"hits": 1}},
                        upsert=True
                    )

        return jsonify({"matches": matches}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
