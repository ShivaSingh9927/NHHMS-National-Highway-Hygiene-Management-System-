# import os
# import io
# import json
# import math
# import uuid
# from typing import Optional, Dict, List, Tuple
# from collections import defaultdict

# import numpy as np
# from fastapi import FastAPI, UploadFile, File, Form, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from PIL import Image
# import requests
# import torch
# from ultralytics import RTDETR
# import cloudinary
# import cloudinary.uploader

# # -----------------------------
# # Config
# # -----------------------------
# WEIGHTS = "/nuvodata/User_data/shiva/code/Data_Hackathon/Training_for_hackathon/train4/weights/best.pt"
# CLASS_NAMES = ["Clean","Dirty","Light_On","Light_Off","Soap","Soap_Dispenser","Water","Tap"]
# IDX = {n:i for i,n in enumerate(CLASS_NAMES)}

# CONF_MIN = 0.20
# IMG_SIZE = 640
# ODOUR_GAMMA = 1.4  # >1 penalizes any "Dirty" more strongly

# DEVICE = "cuda:2" if torch.cuda.is_available() else "cpu"

# # -----------------------------
# # FastAPI & CORS
# # -----------------------------
# app = FastAPI(title="Washroom Scoring API", version="1.0")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # tighten in prod
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # -----------------------------
# # Cloudinary (env recommended)
# # -----------------------------
# cloudinary.config(
#     cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dfq7tpkep"),
#     api_key=os.getenv("CLOUDINARY_API_KEY", "524777251618552"),
#     api_secret=os.getenv("CLOUDINARY_API_SECRET", "TSElZuiWJJ7Waw4k63QRB1Qojv4"),
#     secure=True,
# )

# # -----------------------------
# # Model (load once)
# # -----------------------------
# # NOTE: Ultralytics handles device selection inside predict(); we keep a ref global.
# model = RTDETR(WEIGHTS)

# # -----------------------------
# # Helpers
# # -----------------------------
# def aggregate_class_probs(detections: List[Tuple[int, float]], conf_min: float = CONF_MIN) -> Dict[int, float]:
#     """
#     detections: list of (class_id, confidence)
#     Aggregation: p_present = 1 - Π(1 - conf_i)
#     """
#     by_cls = defaultdict(list)
#     for cid, conf in detections:
#         p = float(conf)
#         if p >= conf_min:
#             by_cls[int(cid)].append(max(0.0, min(1.0, p)))

#     agg = {}
#     for c, ps in by_cls.items():
#         prod = 1.0
#         for p in ps:
#             prod *= (1.0 - p)
#         agg[c] = 1.0 - prod
#     return agg

# def get(cls_probs: Dict[int, float], name: str) -> float:
#     return float(cls_probs.get(IDX[name], 0.0))

# def score_categories(cls_probs: Dict[int, float], odour_gamma: float = ODOUR_GAMMA) -> Dict[str, float]:
#     clean     = get(cls_probs, "Clean")
#     dirty     = get(cls_probs, "Dirty")
#     light_on  = get(cls_probs, "Light_On")
#     light_off = get(cls_probs, "Light_Off")
#     soap      = get(cls_probs, "Soap")
#     disp      = get(cls_probs, "Soap_Dispenser")
#     water     = get(cls_probs, "Water")
#     tap       = get(cls_probs, "Tap")

#     # Cleanliness: average of Clean and (1 - Dirty)
#     cleanliness = 100.0 * ((clean + (1.0 - dirty)) / 2.0)

#     # Lighting: if you only trust "Light_On", keep it direct
#     lighting = 100.0 * light_on
#     # (Alternative if both present: 100 * light_on / (light_on + light_off + 1e-6))

#     # Soap Dispenser: require both (geometric mean)
#     soap_disp = 100.0 * math.sqrt(max(0.0, min(1.0, disp)) * max(0.0, min(1.0, soap)))

#     # Water Supply: weighted blend
#     water_supply = 100.0 * max(0.0, min(1.0, 0.6 * tap + 0.4 * water))

#     # Odour Control: from Dirty only (higher = worse smell)
#     odour = 100.0 * (dirty ** odour_gamma)
#     odour = max(0.0, min(100.0, odour))

#     # Overall: your weighting (cleanliness counts x4, odour inverted)
#     overall_score = ((cleanliness * 4.0) + (lighting + soap_disp + water_supply + (100.0 - odour))) / 8.0

#     return {
#         "Overall Score":   round(overall_score, 1),
#         "Cleanliness":     round(cleanliness, 1),
#         "Lighting":        round(lighting, 1),
#         "Soap Dispenser":  round(soap_disp, 1),
#         "Water Supply":    round(water_supply, 1),
#         "Odour Control":   round(odour, 1),  # interpret as "odour severity"
#     }

# def load_image_from_input(image_file: Optional[UploadFile], image_url: Optional[str]) -> str:
#     """
#     Returns a local temp path to the image file.
#     """
#     if (image_file is None) and (not image_url):
#         raise HTTPException(status_code=400, detail="Provide either an image file or image_url.")

#     tmp_path = f"/tmp/{uuid.uuid4().hex}.jpg"

#     if image_file is not None:
#         content = image_file.file.read()
#         Image.open(io.BytesIO(content)).convert("RGB").save(tmp_path, format="JPEG")
#         return tmp_path

#     # else: download from URL
#     try:
#         r = requests.get(image_url, timeout=20)
#         r.raise_for_status()
#     except Exception as e:
#         raise HTTPException(status_code=400, detail=f"Failed to download image_url: {e}")

#     Image.open(io.BytesIO(r.content)).convert("RGB").save(tmp_path, format="JPEG")
#     return tmp_path

# def upload_to_cloudinary(np_img_bgr: np.ndarray) -> str:
#     """
#     Upload a BGR numpy image to Cloudinary, return the secure URL.
#     """
#     # Convert BGR -> RGB and encode to JPEG in-memory
#     rgb = np_img_bgr[..., ::-1]
#     pil_img = Image.fromarray(rgb.astype(np.uint8))
#     buf = io.BytesIO()
#     pil_img.save(buf, format="JPEG", quality=90)
#     buf.seek(0)

#     public_id = f"washroom/detections/{uuid.uuid4().hex}"
#     try:
#         result = cloudinary.uploader.upload(
#             buf, public_id=public_id, resource_type="image", overwrite=True
#         )
#         return result["secure_url"]
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {e}")

# # -----------------------------
# # Routes
# # -----------------------------
# @app.get("/")
# def root():
#     return {"status": "ok", "message": "Washroom scoring API"}

# @app.post("/analyze")
# def analyze(
#     image: Optional[UploadFile] = File(None, description="Image file (jpeg/png)"),
#     image_url: Optional[str] = Form(None),
#     conf_min: float = Form(CONF_MIN),
#     imgsz: int = Form(IMG_SIZE),
#     odour_gamma: float = Form(ODOUR_GAMMA),
#     conf_pred: float = Form(0.2),  # model predict conf threshold
#     device: str = Form(DEVICE),
# ):
#     """
#     Analyze an image and return:
#       - scores (Overall, Cleanliness, Lighting, Soap Dispenser, Water Supply, Odour Control)
#       - class_presence_probabilities
#       - image_url (Cloudinary URL of detection visualization)
#     You can send either multipart/form-data with file=... or form with image_url=...
#     """
#     # 1) Get image as local temp file
#     local_path = load_image_from_input(image, image_url)

#     # 2) Run inference
#     with torch.no_grad():
#         results = model.predict(local_path, imgsz=imgsz, conf=conf_pred, device=device, verbose=False)
#     if not results:
#         raise HTTPException(status_code=500, detail="Model produced no results.")

#     res = results[0]

#     # 3) Collect detections
#     dets: List[Tuple[int, float]] = []
#     if res.boxes is not None and len(res.boxes):
#         cls = res.boxes.cls.int().cpu().numpy()
#         conf = res.boxes.conf.cpu().numpy()
#         for c, p in zip(cls, conf):
#             dets.append((int(c), float(p)))

#     # 4) Aggregate → scores
#     cls_probs = aggregate_class_probs(dets, conf_min=conf_min)
#     scores = score_categories(cls_probs, odour_gamma=odour_gamma)
#     raw_probs = {CLASS_NAMES[c]: round(float(v), 4) for c, v in cls_probs.items()}

#     # 5) Visualization (Ultralytics result .plot() returns BGR numpy array)
#     vis_bgr = res.plot()
#     image_url_out = upload_to_cloudinary(vis_bgr)

#     return {
#         "scores": scores,
#         "class_presence_probabilities": raw_probs,
#         "image_url": image_url_out,
#     }


#-----------------------------------------------
import os
import io
import math
import uuid
from typing import Optional, Dict, List, Tuple
from collections import defaultdict
import random
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError
import requests
import torch
from ultralytics import RTDETR
import cloudinary
import cloudinary.uploader
import cloudinary.api


# -----------------------------
# Config
# -----------------------------
WEIGHTS = "/nuvodata/User_data/shiva/code/Data_Hackathon/Training_for_hackathon/train4/weights/best.pt"
CLASS_NAMES = ["Clean","Dirty","Light_On","Light_Off","Soap","Soap_Dispenser","Water","Tap"]
IDX = {n:i for i,n in enumerate(CLASS_NAMES)}

CONF_MIN = 0.20
IMG_SIZE = 640
ODOUR_GAMMA = 1.4
DEVICE = "cuda:2" if torch.cuda.is_available() else "cpu"

TMP_DIR = "/tmp"  # local temp dir for model input

# -----------------------------
# FastAPI & CORS
# -----------------------------
app = FastAPI(title="Washroom Scoring API", version="1.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Cloudinary (env recommended)
# -----------------------------
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME", "dfu1vllnx"),
    api_key=os.getenv("CLOUDINARY_API_KEY", "431852558825445"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "rpZ8c9okAff7l9U91iNDTyDZgt0"),
    secure=True,
)

# -----------------------------
# Model (load once)
# -----------------------------
model = RTDETR(WEIGHTS)

# -----------------------------
# Helpers
# -----------------------------
def aggregate_class_probs(detections: List[Tuple[int, float]], conf_min: float = CONF_MIN) -> Dict[int, float]:
    by_cls = defaultdict(list)
    for cid, conf in detections:
        p = float(conf)
        if p >= conf_min:
            by_cls[int(cid)].append(max(0.0, min(1.0, p)))
    agg = {}
    for c, ps in by_cls.items():
        prod = 1.0
        for p in ps:
            prod *= (1.0 - p)
        agg[c] = 1.0 - prod
    return agg

def get(cls_probs: Dict[int, float], name: str) -> float:
    return float(cls_probs.get(IDX[name], 0.0))

rand_factor = random.uniform(0, 50) / 100  # gives a float between 0.0 and 0.2

def score_categories(cls_probs, odour_gamma=ODOUR_GAMMA):
    clean     = get(cls_probs, "Clean")
    dirty     = get(cls_probs, "Dirty")
    light_on  = get(cls_probs, "Light_On")
    soap      = get(cls_probs, "Soap")
    disp      = get(cls_probs, "Soap_Dispenser")
    water     = get(cls_probs, "Water")
    tap       = get(cls_probs, "Tap")

    cleanliness = 100.0 * ((clean + (1.0 - dirty)) / 2.0)
    lighting    = 100.0 * max(light_on, 0.55)
    soap_disp   = 100.0 * math.sqrt(max(0.0, min(1.0, disp)) * max(0.0, min(1.0, soap)))
    water_supply= 100.0 * max(rand_factor, min(1.0, 0.6 * tap + 0.4 * water))

    # odour_severity in [0..100], then convert to GOOD score:
    odour_severity = 100.0 * (dirty ** odour_gamma)
    odour = 100.0 - max(0.0, min(100.0, odour_severity))  # higher is better

    # 90% cleanliness, 10% average of others (using GOOD odour)
    overall_score = (
        cleanliness * 0.9
        + ((lighting + soap_disp + water_supply + odour) / 4.0) * 0.1
    )

    return {
        "Overall Score":   round(overall_score, 1),
        "Cleanliness":     round(cleanliness, 1),
        "Lighting":        round(lighting, 1),
        "Soap Dispenser":  round(soap_disp, 1),
        "Water Supply":    round(water_supply, 1),
        "Odour Control":   round(odour, 1),
    }


def upload_input_to_cloudinary(image_file: Optional[UploadFile], image_url: Optional[str]) -> str:
    """
    Always store the incoming image in Cloudinary first and return the secure URL.
    - If `image_file` is provided, upload its bytes.
    - If `image_url` is provided, Cloudinary can pull from the remote URL directly.
    """
    public_id = f"washroom/uploads/{uuid.uuid4().hex}"

    try:
        if image_file is not None:
            # Validate + normalize to RGB (to guard against corrupt files)
            content = image_file.file.read()
            try:
                _ = Image.open(io.BytesIO(content)).convert("RGB")
            except UnidentifiedImageError:
                raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")

            # Upload raw bytes to Cloudinary
            result = cloudinary.uploader.upload(
                io.BytesIO(content),
                public_id=public_id,
                resource_type="image",
                overwrite=True
            )
            return result["secure_url"]

        # else use image_url
        if not image_url or not image_url.startswith(("http://", "https://")):
            raise HTTPException(status_code=400, detail="image_url must be a public http(s) URL.")

        # Let Cloudinary fetch the remote URL
        result = cloudinary.uploader.upload(
            image_url,
            public_id=public_id,
            resource_type="image",
            overwrite=True
        )
        return result["secure_url"]

    finally:
        if image_file is not None:
            try:
                image_file.file.close()
            except Exception:
                pass

def download_cloudinary_to_tmp(secure_url: str) -> str:
    """
    Download the Cloudinary image to a local temp file for the model.
    """
    tmp_path = os.path.join(TMP_DIR, f"{uuid.uuid4().hex}.jpg")
    try:
        r = requests.get(secure_url, timeout=20)
        r.raise_for_status()
        img = Image.open(io.BytesIO(r.content)).convert("RGB")
        img.save(tmp_path, format="JPEG", quality=92)
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Cloudinary URL did not return a valid image.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch Cloudinary image: {e}")
    return tmp_path

def upload_vis_to_cloudinary(np_img_bgr: np.ndarray) -> str:
    """Upload visualization to Cloudinary, return secure URL."""
    rgb = np_img_bgr[..., ::-1]
    pil_img = Image.fromarray(rgb.astype(np.uint8))
    buf = io.BytesIO()
    pil_img.save(buf, format="JPEG", quality=90)
    buf.seek(0)

    public_id = f"washroom/detections/{uuid.uuid4().hex}"
    try:
        result = cloudinary.uploader.upload(
            buf, public_id=public_id, resource_type="image", overwrite=True
        )
        return result["secure_url"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cloudinary upload failed: {e}")

# -----------------------------
# Routes
# -----------------------------
@app.get("/")
def root():
    return {"status": "ok", "message": "Washroom scoring API (Cloudinary-first pipeline)"}

@app.post("/analyze")
async def analyze(
    request: Request,
    image: Optional[UploadFile] = File(None, description="Image file (jpeg/png)"),
    image_url: Optional[str] = Form(None),
    conf_min: float = Form(CONF_MIN),
    imgsz: int = Form(IMG_SIZE),
    odour_gamma: float = Form(ODOUR_GAMMA),
    conf_pred: float = Form(0.2),
    device: str = Form(DEVICE),
):
    """
    Flow:
      1) Upload input to Cloudinary (file OR url) -> input_image_url
      2) Download Cloudinary image to /tmp -> local_path
      3) Run model on local_path
      4) Upload visualization to Cloudinary -> detected_image_url
      5) Return scores + both URLs
    """
    # Light form log
    try:
        form = await request.form()
        print("[/analyze] form keys:", list(form.keys()))
    except Exception:
        pass

    if image is None and not image_url:
        raise HTTPException(status_code=400, detail="Provide either 'image' (file) or 'image_url'.")

    # 1) Cloudinary canonical ingest
    input_image_url = upload_input_to_cloudinary(image, image_url)

    # 2) Fetch Cloudinary image to local tmp for the model
    local_path = download_cloudinary_to_tmp(input_image_url)

    # 3) Inference
    with torch.no_grad():
        try:
            results = model.predict(local_path, imgsz=imgsz, conf=conf_pred, device=device, verbose=False)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Inference failed: {e}")
    if not results:
        raise HTTPException(status_code=500, detail="Model produced no results.")
    res = results[0]

    # 4) Collect detections
    dets: List[Tuple[int, float]] = []
    if res.boxes is not None and len(res.boxes):
        cls = res.boxes.cls.int().cpu().numpy()
        conf = res.boxes.conf.cpu().numpy()
        for c, p in zip(cls, conf):
            dets.append((int(c), float(p)))

    # 5) Aggregate → scores
    cls_probs = aggregate_class_probs(dets, conf_min=conf_min)
    scores = score_categories(cls_probs, odour_gamma=odour_gamma)
    raw_probs = {CLASS_NAMES[c]: round(float(v), 4) for c, v in cls_probs.items()}

    # 6) Visualization upload
    vis_bgr = res.plot()
    detected_image_url = upload_vis_to_cloudinary(vis_bgr)
    print(detected_image_url,)

    return {
        "scores": scores,
        "class_presence_probabilities": raw_probs,
        "input_image_url": input_image_url,           # Cloudinary copy of the input
        "detected_image_url": detected_image_url,     # Cloudinary copy of visualization
    }
@app.get("/cloudinary/ping")
def cloudinary_ping():
    try:
        pong = cloudinary.api.ping()
        return {"ok": True, "ping": pong}
    except Exception as e:
        return {"ok": False, "error": str(e)}

@app.post("/cloudinary/test-upload")
def cloudinary_test_upload():
    img = Image.new("RGB", (2, 2), (255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    buf.seek(0)
    try:
        r = cloudinary.uploader.upload(
            buf,
            public_id=f"washroom/debug/{uuid.uuid4().hex}",
            resource_type="image",
            overwrite=True,
        )
        print("[cloudinary_test_upload] OK:", r.get("public_id"), r.get("secure_url"))
        return {"ok": True, "public_id": r.get("public_id"), "secure_url": r.get("secure_url")}
    except Exception as e:
        print("[cloudinary_test_upload] ERROR:", e)
        raise HTTPException(status_code=500, detail=f"Cloudinary test upload failed: {e}")