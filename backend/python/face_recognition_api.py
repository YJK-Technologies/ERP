from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
import base64
import dlib
from ultralytics import YOLO

# -------------------- Flask App --------------------
app = Flask(__name__)
CORS(app)

# -------------------- Models --------------------

# YOLOv8 Face Detection Model (expects BGR image)
yolo_face_detector = YOLO("yolov8n-face.pt")

# Dlib models
face_rec_model = dlib.face_recognition_model_v1(
    "dlib_face_recognition_resnet_model_v1.dat"
)
shape_predictor = dlib.shape_predictor(
    "shape_predictor_68_face_landmarks.dat"
)

# -------------------- Utilities --------------------

def decode_image(base64_string):
    """
    Decode base64 image string to OpenCV BGR image
    """
    try:
        # Remove data:image/...;base64, if present
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]

        image_data = base64.b64decode(base64_string)
        np_arr = np.frombuffer(image_data, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if image is None:
            return None

        return image  # BGR image

    except Exception as e:
        print("Error decoding image:", str(e))
        return None


def enhance_low_light(image_rgb):
    """
    Improve low-light image quality (expects RGB)
    """
    lab = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    enhanced = cv2.merge((l, a, b))
    return cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)


def get_face_encoding(image_bgr):
    """
    Detect face using YOLO (BGR),
    Encode face using dlib (RGB)
    """
    try:
        # Convert to RGB for enhancement & dlib
        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        image_rgb = enhance_low_light(image_rgb)

        # YOLO MUST receive BGR image
        yolo_results = yolo_face_detector(image_bgr)
        detections = yolo_results[0].boxes.xyxy.cpu().numpy()

        if len(detections) == 0:
            return None

        # Take first detected face
        x1, y1, x2, y2 = map(int, detections[0])

        rect = dlib.rectangle(x1, y1, x2, y2)
        landmarks = shape_predictor(image_rgb, rect)

        encoding = np.array(
            face_rec_model.compute_face_descriptor(image_rgb, landmarks),
            dtype=np.float32
        )

        return encoding

    except Exception as e:
        print("Error extracting face encoding:", str(e))
        return None


# -------------------- APIs --------------------

@app.route("/encode", methods=["POST"])
def encode_face():
    try:
        data = request.get_json(silent=True)

        if not data or "image" not in data:
            return jsonify({"error": "Image field missing"}), 400

        image = decode_image(data["image"])
        if image is None:
            return jsonify({"error": "Invalid image data"}), 400

        encoding = get_face_encoding(image)
        if encoding is None:
            return jsonify({"error": "No face detected"}), 400

        return jsonify({"encoding": encoding.tolist()})

    except Exception as e:
        print("Encode API error:", str(e))
        return jsonify({"error": "Encoding failed"}), 500


@app.route("/recognize", methods=["POST"])
def recognize_face():
    try:
        data = request.get_json(silent=True)

        if not data or "image" not in data:
            return jsonify({"error": "Image field missing"}), 400

        image = decode_image(data["image"])
        if image is None:
            return jsonify({"error": "Invalid image data"}), 400

        encoding = get_face_encoding(image)
        if encoding is None:
            return jsonify({"error": "No face detected"}), 400

        return jsonify({"encoding": encoding.tolist()})

    except Exception as e:
        print("Recognition API error:", str(e))
        return jsonify({"error": "Recognition failed"}), 500


@app.route("/match", methods=["POST"])
def match_faces():
    try:
        data = request.get_json(silent=True)

        stored_encoding = np.array(data.get("storedEncoding"), dtype=np.float32)
        input_encoding = np.array(data.get("inputEncoding"), dtype=np.float32)

        if stored_encoding.shape != (128,) or input_encoding.shape != (128,):
            return jsonify({"error": "Invalid encoding format"}), 400

        distance = np.linalg.norm(stored_encoding - input_encoding)
        threshold = 0.45

        return jsonify({
            "match": int(distance < threshold),
            "similarity_score": round((1 - distance).item(), 3)
        })

    except Exception as e:
        print("Match API error:", str(e))
        return jsonify({"error": "Face match failed"}), 500


# -------------------- Run Server --------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)