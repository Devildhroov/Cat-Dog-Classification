Live Link:https://cat-dog-classification-hurk.onrender.com/app/#predict
# 🐱🐶 Cat & Dog Classification using CNN

A deep learning project that uses a **Convolutional Neural Network (CNN)** to classify images into two categories: **Cat** 🐱 or **Dog** 🐶.

The project covers the complete machine-learning workflow, from loading and preprocessing images to training, evaluating, saving, and serving the trained model through a **FastAPI backend**.

---

## 🌟 Project Preview

The application provides a modern dark-themed interface where users can:

- 📤 Upload a cat or dog image
- 🤖 Get an AI-based prediction
- 📊 View the prediction confidence
- 🔄 Try another image
- 🕒 View prediction history
- 📱 Use the application on different screen sizes

---

## 🧠 How It Works

```text
                 ┌─────────────────┐
                 │  Cat & Dog      │
                 │    Dataset      │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Image           │
                 │ Preprocessing   │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Train /         │
                 │ Validation/Test │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │      CNN        │
                 │     Model       │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Model Training  │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Trained .keras  │
                 │     Model       │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ FastAPI Backend │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Image Upload    │
                 └────────┬────────┘
                          ↓
                 ┌─────────────────┐
                 │ Cat / Dog       │
                 │ + Confidence    │
                 └─────────────────┘
```

---

## ✨ Features

### 🧠 Machine Learning

- Convolutional Neural Network for image classification
- Image resizing and normalization
- Training, validation, and testing
- Binary classification: Cat vs Dog
- Model evaluation
- Accuracy and loss visualization
- Saved trained model

### ⚡ Backend

- FastAPI REST API
- Image upload endpoint
- Real-time model prediction
- Confidence score
- Health-check endpoint
- Automatic API documentation with Swagger UI

### 🎨 Frontend

- Modern dark-themed UI
- Neon-style visual elements
- Image upload interface
- Prediction result screen
- Confidence visualization
- Prediction history
- Responsive design

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Python | Main programming language |
| TensorFlow | Deep learning framework |
| Keras | CNN model development |
| NumPy | Numerical operations |
| Pillow | Image processing |
| Matplotlib | Visualization |
| Scikit-learn | Model evaluation |
| FastAPI | Backend API |
| Uvicorn | API server |
| HTML | Frontend structure |
| CSS | Frontend styling |
| JavaScript | Frontend functionality |

---

# 📂 Project Structure

```text
cat-and-dog-project/
│
├── dataset/
│   ├── cat/
│   │   ├── cat.1.jpg
│   │   ├── cat.2.jpg
│   │   └── ...
│   │
│   └── dog/
│       ├── dog.1.jpg
│       ├── dog.2.jpg
│       └── ...
│
├── model/
│   └── cat_dog_cnn.keras
│
├── backend/
│   └── main.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── Cat_Dog_CNN.ipynb
│
├── requirements.txt
│
└── README.md
```

---

# 📊 Dataset

The project uses a **Cat and Dog Classification Dataset** containing separate folders for cats and dogs.

Dataset structure:

```text
dataset/
│
├── cat/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
│
└── dog/
    ├── image1.jpg
    ├── image2.jpg
    └── ...
```

The dataset is loaded using TensorFlow's `image_dataset_from_directory()` function.

Images are resized to:

```text
128 × 128 pixels
```

and processed as RGB images.

---

# 🧠 CNN Architecture

The CNN consists of multiple convolutional and pooling layers followed by fully connected layers.

```text
Input Image
128 × 128 × 3
       ↓
Rescaling
       ↓
Conv2D (32 filters)
       ↓
MaxPooling
       ↓
Conv2D (64 filters)
       ↓
MaxPooling
       ↓
Conv2D (128 filters)
       ↓
MaxPooling
       ↓
Flatten
       ↓
Dense (128)
       ↓
Dropout
       ↓
Sigmoid Output
       ↓
Cat / Dog
```

### Why CNN?

CNNs are particularly effective for image classification because they can automatically learn visual features such as:

- Edges
- Shapes
- Textures
- Eyes
- Ears
- Fur patterns
- Other visual characteristics

The model gradually learns more complex features as the image passes through the convolutional layers.

---

# ⚙️ Model Configuration

The model uses:

```text
Image Size       : 128 × 128
Color Channels   : 3 (RGB)
Optimizer        : Adam
Loss Function    : Binary Crossentropy
Output Activation: Sigmoid
```

Since this is a binary classification problem, the final layer contains one neuron with a sigmoid activation function.

The output represents the probability of the image belonging to the **dog** class.

For example:

```text
Prediction = 0.92

Dog confidence = 92%
Cat confidence = 8%
```

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Move into the project directory:

```bash
cd YOUR_REPOSITORY
```

---

## 2. Create a virtual environment

### Windows

```bash
python -m venv .venv
```

Activate it:

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv .venv
```

```bash
source .venv/bin/activate
```

---

## 3. Install dependencies

```bash
pip install -r requirements.txt
```

If you haven't created `requirements.txt` yet, install the main packages:

```bash
pip install tensorflow numpy matplotlib pillow scikit-learn fastapi uvicorn python-multipart
```

---

# 🏋️ Training the Model

Open:

```text
Cat_Dog_CNN.ipynb
```

Run the notebook cells in order.

The general training process is:

```python
history = model.fit(
    train_dataset,
    validation_data=validation_dataset,
    epochs=15
)
```

After training, save the model:

```python
model.save("model/cat_dog_cnn.keras")
```

---

# 📈 Model Evaluation

The model can be evaluated using the test dataset:

```python
test_loss, test_accuracy = model.evaluate(test_dataset)

print("Test Accuracy:", test_accuracy)
```

Training and validation accuracy can also be visualized using Matplotlib.

Example:

```python
plt.plot(history.history["accuracy"])
plt.plot(history.history["val_accuracy"])

plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend(["Training", "Validation"])

plt.show()
```

---

# ⚡ Running the FastAPI Backend

From the root project directory:

```bash
uvicorn backend.main:app --reload
```

The backend will start at:

```text
http://127.0.0.1:8000
```

---

# 🔌 API Endpoints

## `GET /`

Checks whether the API is running.

Example response:

```json
{
    "message": "Cat and Dog Classification API is running"
}
```

---

## `GET /health`

Checks the backend and model status.

Example:

```json
{
    "status": "healthy",
    "model": "loaded"
}
```

---

## `POST /predict`

Uploads an image and returns the classification.

Example response:

```json
{
    "prediction": "dog",
    "confidence": 94.37
}
```

---

# 📚 API Documentation

FastAPI automatically generates interactive API documentation.

After starting the backend, open:

```text
http://127.0.0.1:8000/docs
```

From there you can test the `/predict` endpoint directly by uploading an image.

---

# 🖥️ Frontend

The frontend provides a simple interface for interacting with the CNN model.

### Main workflow

```text
Upload Image
     ↓
Send image to FastAPI
     ↓
CNN processes image
     ↓
Prediction returned
     ↓
Display result
```

Example:

```text
┌─────────────────────────────┐
│      Cat & Dog Classifier   │
│                             │
│       📤 Upload Image       │
│                             │
│       [ Choose File ]       │
│                             │
│          [Predict]          │
│                             │
│       🐶 Dog                │
│       Confidence: 94.37%    │
└─────────────────────────────┘
```

---

# 🔮 Future Improvements

Some possible improvements include:

- [ ] Data augmentation
- [ ] Hyperparameter tuning
- [ ] Early stopping
- [ ] Learning-rate scheduling
- [ ] Transfer learning
- [ ] MobileNet / EfficientNet comparison
- [ ] Improved UI animations
- [ ] User authentication
- [ ] Cloud deployment
- [ ] Prediction analytics
- [ ] Support for additional animal classes

---

# 🎯 Learning Objectives

This project demonstrates the practical implementation of:

- Machine Learning
- Deep Learning
- Convolutional Neural Networks
- Image preprocessing
- Dataset management
- Model training
- Model evaluation
- REST APIs
- FastAPI
- Frontend-backend integration

It is designed to demonstrate how a trained deep-learning model can be converted into a usable application.

---

# 👨‍💻 Author

**Lagging Lassi**

Built as a learning project to explore **CNN-based image classification and full-stack machine-learning applications**.

---

# ⭐ If You Like This Project

If you found this project useful or interesting, consider giving the repository a ⭐ on GitHub!
