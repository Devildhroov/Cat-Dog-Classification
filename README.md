# Cat & Dog Classification

A cat-and-dog image classifier powered by a TensorFlow CNN, with a FastAPI
backend and a responsive web frontend.

## Run the app

1. Install Python 3.12 if it is not already installed.
2. From the project folder, double-click `start_backend.bat`.
   The first run installs the packages in `requirements.txt`.
3. Open <http://127.0.0.1:8000/> in your browser.
4. Upload an image or try one of the built-in cat and dog samples.

Keep the terminal window open while using the app. The API health endpoint is
available at <http://127.0.0.1:8000/health>.

To start the server manually from the project folder:

```powershell
python -m pip install -r requirements.txt
python -m uvicorn backend.main:app --reload
```

## Project contents

- `backend/main.py` — FastAPI app, image preprocessing, and model inference.
- `frontend/` — Responsive classifier dashboard.
- `cat_dog_cnn.keras` — Trained CNN loaded by the API.
- `Cat_Dog_CNN.ipynb` — Model training and evaluation notebook.

The training dataset and local Python virtual environments are intentionally
not included in this repository. The image dataset is large; place your
training images in the expected class-folder structure before running the
notebook. The app itself only needs the included trained model.

## Deploy on Render

1. Push this repository to GitHub and connect that repository to Render.
2. In the Render dashboard, choose **New** → **Blueprint** and select this
   repository. Render will read `render.yaml` and create the web service.
3. Confirm the service plan before deploying. The configured `1c-2g` plan
   provides 1 CPU and 2 GB of RAM; it is a paid plan selected to give
   TensorFlow room to load the model.
4. Once the deploy is healthy, open the service URL. Render runs the frontend
   and API together, so no separate frontend service or environment variables
   are needed.

The health check uses `/health`. The model is loaded from the included
`cat_dog_cnn.keras` file at service startup.
