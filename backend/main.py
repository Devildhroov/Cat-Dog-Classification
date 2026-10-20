from pathlib import Path
from typing import Literal

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from PIL import Image
import numpy as np
import tensorflow as tf


PROJECT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = PROJECT_DIR / "frontend"
DATASET_DIR = PROJECT_DIR / "Dataset"


# Create FastAPI application
app = FastAPI(
    title="Cat and Dog Classification API",
    description="CNN backend for classifying cats and dogs",
    version="1.0"
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load trained CNN model
MODEL_PATH = PROJECT_DIR / "cat_dog_cnn.keras"
model = tf.keras.models.load_model(MODEL_PATH)


# Image size used while training
IMG_SIZE = 128


# Classes
class_names = ["cat", "dog"]


@app.get("/")
def home():
    return RedirectResponse(url="/app/")


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": "loaded"
    }


@app.get("/samples/{kind}")
def sample_image(kind: Literal["cat", "dog"]):
    sample_paths = {
        "cat": DATASET_DIR / "Cat" / "12500.jpeg",
        "dog": DATASET_DIR / "Dog" / "5953.jpg",
    }
    return FileResponse(sample_paths[kind])


@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    # Read uploaded image
    image_data = await file.read()

    # Open image
    image = Image.open(
        __import__("io").BytesIO(image_data)
    ).convert("RGB")

    # Resize image
    image = image.resize(
        (IMG_SIZE, IMG_SIZE)
    )

    # The model starts with a Rescaling(1./255) layer, so it expects raw pixels.
    image_array = np.asarray(image, dtype=np.float32)

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    # Make prediction
    prediction = model.predict(
        image_array,
        verbose=0
    )[0][0]

    # Convert prediction to class
    if prediction >= 0.5:
        predicted_class = "dog"
        confidence = float(prediction)
    else:
        predicted_class = "cat"
        confidence = float(1 - prediction)

    return {
        "prediction": predicted_class,
        "confidence": round(confidence * 100, 2)
    }


app.mount("/app", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")