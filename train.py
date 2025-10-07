from ultralytics import RTDETR
from ultralytics import YOLO
import torch

# Load a COCO-pretrained RT-DETR-l model
model = RTDETR("rtdetr-l.pt")
#model = RTDETR("/mnt/nvme_disk2/User_data/ss57076k/runs/detect/train19/weights/best.pt")
# model = YOLO("/mnt/nvme_disk2/User_data/ss57076k/runs/detect/train13/weights/best.pt")

# Display model information (optional)
model.info()
# torch.cuda.set_device(3)

# Train the model on the dataset
results = model.train(
    data="/nuvodata/User_data/shiva/code/Data_Hackathon/info.yaml",
    epochs=37,
    imgsz=640,
    batch=60,
    augment=True,     # Enable data augmentation
    rect=True,
    # device=[1,4,6,7] ,   # Uses rectangular training for better aspect ratio handling
    # device=[3,4,5,6] ,   # Use GPU if available
    # classes=[1,2,4,5],
    fraction=0.8,
    project='Training_for_hackathon',
    cls=0.7,
    lr0=0.0001,
    lrf=0.001,
    warmup_epochs=10,
)


# Validate with a custom dataset
# model.val(data="/weka/kanpur/data_radiovision/cxr-dataset/processed_dataset/detection_nodule_6_aug/info.yaml",
#           device=[1,2],batch=64,name='Testing for opacity_8aug',project='testing_for_opacity')#,classes=[1,2,4,5],batch=128,iou=0.3,name=testing_4_classes_iou_0.3)
# # print(metrics.box.map)  # map50-95