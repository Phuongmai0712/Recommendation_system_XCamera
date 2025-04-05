from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from functools import lru_cache
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from pydantic import BaseModel
from io import StringIO 
from typing import List, Optional, Dict, Any
from openai import OpenAI
import os

app = FastAPI()
client = OpenAI(
    base_url="https://api.aimlapi.com/v1",
    api_key="25ce94a4986f416a9b8e479ed280ff45",  
)

# Danh sách purposes hợp lệ cho từng category
PURPOSES_PER_CATEGORY = {
    'cameras': ['Beginner', 'Professional', 'Sports', 'Video', 'Daily Use', 'Travel', 'Vlogging', 'Studio'],
    'lenses': ['Landscape', 'Travel', 'Portrait', 'Sports', 'Macro', 'Street', 'Video'],
    'drones': ['Sports', 'Travel', 'Vlogging', 'Professional', 'Easy of use'],
    'gimbals': ['Travel', 'Vlogging', 'Professional', 'Easy of use'],
    'action_cameras': ['Travel', 'Sports', 'Vlogging', 'Durability', 'Easy of use', 'Low-light Performance']
}
# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class RecommendationRequest(BaseModel):
    category: str
    criteria: Dict[str, Any]

# Hàm load và xử lý dữ liệu
@lru_cache(maxsize=1)
def load_data():
    try:
        pd.set_option('future.no_silent_downcasting', True)
        # 1. Tải bảng Inventory từ Google Sheets
        scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
        creds = ServiceAccountCredentials.from_json_keyfile_name("C:\\Users\\Admin\\Downloads\\inventoryreader-454903-25f852b85ccf.json", scope)
        # creds = ServiceAccountCredentials.from_json_keyfile_name("D:\\KLTN\\inventoryreader-454903-25f852b85ccf.json", scope)
        client = gspread.authorize(creds)
        sheet_url = "https://docs.google.com/spreadsheets/d/1zDG2XgHJPbtanTS-KDB2gOsCUGBtFk92JJe5EuuN8BI/edit?gid=0#gid=0"
        sheet = client.open_by_url(sheet_url)
        inventory_df = pd.DataFrame(sheet.worksheet("Sheet1").get_all_records())
        # Preprocessing Inventory
        # downcase tên cũng như price chuyển thành thập phân hết
        inventory_df['Price'] = inventory_df['Price'].replace(r'[\$,]', '', regex=True).astype(float)
        inventory_df['Model'] = inventory_df['Model'].str.strip().str.lower()
        inventory_df['Colour'] = inventory_df['Colour'].str.strip().str.lower()
        inventory_df.dropna(subset=['Model'], inplace=True)
        inventory_df.to_csv('inventory_log.csv', index=False)
        # 2. Tạo DataFrame từ dữ liệu
        specs_dfs = {}

        # Cameras (giữ nguyên dữ liệu của bạn)
        cameras_data = """Model,Weight (gram),Sensor Size,Resolution (MP),Quality 4K,ISO Min,ISO Max,Flipscreen,Flipscreen Type,Film Simulation,Autofocus Type,Burst Shooting (fps),External Mic Input,Optical Viewfinder,Electronic Viewfinder (EVF),USB-C,WiFi,Bluetooth,IBIS,Weathersealing,Release Year,Compatible Lens Type,Dimensions (mm),Design Style,Rangefinder-style,Battery Life (frames),Beginner,Professional,Sports,Video,Daily Use,Travel,Vlogging,Studio
    X-H2S,660,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Full,Yes,Hybrid,15,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2022,Fujifilm X,136x93x95,mirrorless,No,580,0.4,0.9,0.9,0.9,0.4,0.4,0.6,0.9
    X-H2,660,APS-C (23.5x15.6mm),40,Yes,125,12800,Yes,Full,Yes,Hybrid,15,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2022,Fujifilm X,136x93x95,mirrorless,No,680,0.4,0.9,0.7,0.9,0.4,0.4,0.6,0.9
    X-T5,557,APS-C (23.5x15.6mm),40,Yes,125,12800,Yes,Tilt,Yes,Hybrid,15,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2022,Fujifilm X,130x91x64,mirrorless,No,580,0.4,0.85,0.7,0.7,0.6,0.6,0.6,0.85
    X100VI,521,APS-C (23.5x15.6mm),40,Yes,125,12800,Yes,Tilt,Yes,Hybrid,8,Yes,Yes,Yes,Yes,Yes,Yes,Yes,Yes (partial),2024,Fixed (35mm equiv.),128x75x55,compact,Yes,450,0.6,0.7,0.4,0.7,0.85,0.85,0.85,0.4
    X-S20,491,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Full,Yes,Hybrid,8,Yes,No,Yes,Yes,Yes,Yes,Yes,No,2023,Fujifilm X,127x85x65,mirrorless,No,750,0.85,0.7,0.4,0.85,0.85,0.85,0.85,0.4
    X-T50,438,APS-C (23.5x15.6mm),40,Yes,125,12800,Yes,Tilt,Yes,Hybrid,10,Yes,No,Yes,Yes,Yes,Yes,Yes,No,2024,Fujifilm X,124x84x49,mirrorless,No,305,0.85,0.7,0.4,0.7,0.85,0.85,0.7,0.4
    X-T30 II,383,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Tilt,Yes,Hybrid,8,Yes,No,Yes,Yes,Yes,Yes,No,No,2021,Fujifilm X,118x83x47,mirrorless,No,380,0.85,0.4,0.4,0.4,0.85,0.85,0.6,0.4
    X-E4,364,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Tilt,Yes,Hybrid,8,Yes,No,Yes,Yes,Yes,Yes,No,No,2021,Fujifilm X,121x73x33,mirrorless,No,380,0.6,0.4,0.25,0.4,0.85,0.85,0.6,0.25
    X-Pro3,497,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Tilt,Yes,Hybrid,11,Yes,Yes,Yes,Yes,Yes,Yes,No,Yes,2019,Fujifilm X,141x83x46,mirrorless,Yes,400,0.4,0.85,0.4,0.4,0.6,0.6,0.4,0.7
    X100V,478,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Tilt,Yes,Hybrid,11,Yes,Yes,Yes,Yes,Yes,Yes,No,Yes (partial),2020,Fixed (35mm equiv.),128x75x53,compact,Yes,420,0.6,0.7,0.4,0.7,0.85,0.85,0.85,0.4
    X-T4,607,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Full,Yes,Hybrid,15,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2020,Fujifilm X,135x93x84,mirrorless,No,500,0.4,0.85,0.7,0.85,0.6,0.6,0.85,0.85
    X-S10,465,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Full,Yes,Hybrid,8,Yes,No,Yes,Yes,Yes,Yes,Yes,No,2020,Fujifilm X,126x85x65,mirrorless,No,325,0.85,0.7,0.4,0.7,0.85,0.85,0.85,0.4
    X-T3,539,APS-C (23.5x15.6mm),26,Yes,80,51200,Yes,Tilt,Yes,Hybrid,11,Yes,No,Yes,Yes,Yes,Yes,No,Yes,2018,Fujifilm X,133x93x59,mirrorless,No,390,0.4,0.7,0.7,0.7,0.6,0.6,0.6,0.7
    X-T200,370,APS-C (23.5x15.7mm),24,Yes,100,51200,Yes,Full,Yes,Hybrid,8,Yes,No,Yes,Yes,Yes,Yes,No,No,2020,Fujifilm X,121x84x55,mirrorless,No,270,0.85,0.25,0.25,0.4,0.85,0.85,0.6,0.25
    X-T20,383,APS-C (23.6x15.6mm),24,Yes,200,12800,Yes,Tilt,Yes,Hybrid,8,Yes,No,Yes,No,Yes,No,No,No,2017,Fujifilm X,118x83x41,mirrorless,No,350,0.6,0.4,0.25,0.4,0.85,0.85,0.4,0.25
    X-E3,337,APS-C (23.6x15.6mm),24,Yes,200,12800,No,Tilt,Yes,Hybrid,8,Yes,No,Yes,No,Yes,Yes,No,No,2017,Fujifilm X,121x74x43,mirrorless,Yes,350,0.6,0.4,0.25,0.4,0.85,0.85,0.4,0.25
    X-A7,320,APS-C (23.5x15.7mm),24,Yes,100,12800,Yes,Full,Yes,Contrast Detection,6,No,No,No,No,Yes,Yes,No,No,2019,Fujifilm X,119x38x41,mirrorless,No,270,0.85,0.25,0.25,0.4,0.85,0.85,0.6,0.25
    X-A5,361,APS-C (23.5x15.7mm),24,No,200,12800,Yes,Tilt,Yes,Contrast Detection,6,No,No,No,No,Yes,Yes,No,No,2018,Fujifilm X,117x68x40,mirrorless,No,450,0.85,0.25,0.25,0.25,0.85,0.85,0.4,0.25
    X-A3,339,APS-C (23.5x15.7mm),24,No,200,6400,Tilt,Tilt,Yes,Contrast Detection,6,No,No,No,No,Yes,No,No,No,2016,Fujifilm X,117x67x40,mirrorless,No,410,0.85,0.25,0.25,0.25,0.85,0.85,0.4,0.25
    GFX 100 II,1030,Medium Format (43.8x32.9mm),102,Yes,80,102400,Yes ,Full,Yes,Hybrid,5,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2023,GF lenses,152 x 117 x 99,mirrorless,No,540,0.25,0.9,0.7,0.9,0.25,0.25,0.4,0.9
    GFX 100S II,883,Medium Format (43.8x32.9mm),102,Yes,80,102400,Yes ,Full,Yes,Hybrid,5,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2024,GF lenses,150 x 104 x 87,mirrorless,No,530,0.25,0.9,0.7,0.9,0.25,0.25,0.4,0.9
    GFX 50S II,900,Medium Format (43.8x32.9mm),51.4,Yes,100,102400,Yes ,Full,Yes,Contrast Detection,5,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2021,GF lenses,150 x 104 x 87,mirrorless,No,440,0.25,0.85,0.4,0.7,0.25,0.25,0.25,0.85
    GFX 100S,900,Medium Format (43.8x32.9mm),102,Yes,100,102400,Yes ,Full,Yes,Hybrid,5,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2021,GF lenses,150 x 104 x 87,mirrorless,No,460,0.25,0.85,0.4,0.7,0.25,0.25,0.4,0.85
    GFX 100,1400,Medium Format (43.8x32.9mm),102,Yes,100,102400,Yes,Full,Yes,Contrast Detection,5,Yes,No,Yes,Yes,Yes,Yes,Yes,Yes,2019,GF lenses,156 x 144 x 75,mirrorless,No,740,0.25,0.85,0.4,0.7,0.25,0.25,0.25,0.85
    GFX 50R,775,Medium Format (43.8x32.9mm),51.4,No,100,102400,No,,Yes,Contrast Detection,3,Yes,No,Yes,Yes,Yes,Yes,No,Yes,2018,GF lenses,161 x 97 x 66,mirrorless,Yes,400,0.25,0.85,0.25,0.4,0.25,0.25,0.25,0.85
    GFX 100RF,735,Medium Format (43.8x32.9mm),102,Yes,100,12800,Yes,Tilt,Yes,Hybrid,5,Yes,Yes,Yes,Yes,Yes,Yes,No,Yes,2025,Fixed (35mm equiv.),133 x 90 x 76,mirrorless,Yes,820,0.25,0.85,0.25,0.7,0.6,0.6,0.6,0.85
    X-M5,355,APS-C (23.5x15.6mm),26,Yes,160,12800,Yes,Full,Yes,Hybrid,10,Yes,No,No,Yes,Yes,Yes,No,No,2024,Fujifilm X,112 x 64 x 38 ,mirrorless,No,300,0.85,0.4,0.25,0.7,0.85,0.85,0.85,0.25
    X-Pro4,450,APS-C (23.5x15.6mm),40.2,Yes,160,12800,Yes,Full,Yes,Hybrid,15,Yes,Yes,Yes,Yes,Yes,Yes,Yes,Yes,2025,Fujifilm X,128 x 75 x 54,mirrorless,Yes,450,0.4,0.85,0.4,0.7,0.6,0.6,0.4,0.7"""
        specs_dfs['cameras'] = pd.read_csv(StringIO(cameras_data))

        # Lenses (giữ nguyên dữ liệu của bạn)
        lenses_data = """Model,Lens Type,Focal Length (mm),Max Aperture,Image Stabilization (OIS),Weight (gram),Filter Size (mm),Mount Type,Landscape,Travel,Portrait,Sports,Macro,Street,Video,Minimum Focusing Distance (mm)
XF 8mm f/3.5 R WR,Fixed,8,3.5,No,215,62,X-mount,0.92,0.88,0.15,0.1,0.2,0.65,0.3,20
XF 14mm f/2.8 R,Fixed,14,2.8,No,235,58,X-mount,0.88,0.82,0.2,0.15,0.25,0.7,0.35,18
XF 16mm f/1.4 R WR,Fixed,16,1.4,No,375,67,X-mount,0.85,0.68,0.62,0.2,0.78,0.82,0.58,15
XF 16mm f/2.8 R WR,Fixed,16,2.8,No,155,49,X-mount,0.82,0.9,0.22,0.15,0.2,0.85,0.28,17
XF 18mm f/1.4 R LM WR,Fixed,18,1.4,No,370,62,X-mount,0.65,0.62,0.88,0.25,0.3,0.88,0.85,20
XF 18mm f/2 R,Fixed,18,2,No,116,52,X-mount,0.6,0.92,0.28,0.15,0.25,0.9,0.2,18
XF 23mm f/1.4 R LM WR,Fixed,23,1.4,No,375,62,X-mount,0.68,0.65,0.85,0.25,0.3,0.88,0.82,19
XF 23mm f/2 R WR,Fixed,23,2,No,180,43,X-mount,0.62,0.88,0.58,0.2,0.25,0.85,0.3,22
XF 27mm f/2.8 R WR,Fixed,27,2.8,No,84,39,X-mount,0.6,0.95,0.55,0.15,0.2,0.82,0.25,34
XF 33mm f/1.4 R LM WR,Fixed,33,1.4,No,360,58,X-mount,0.65,0.6,0.9,0.25,0.3,0.88,0.85,30
XF 35mm f/1.4 R,Fixed,35,1.4,No,187,52,X-mount,0.62,0.65,0.88,0.2,0.25,0.85,0.3,28
XF 35mm f/2.0 R WR,Fixed,35,2,No,170,43,X-mount,0.6,0.88,0.6,0.2,0.25,0.82,0.28,35
XC 35mm f/2,Fixed,35,2,No,130,43,X-mount,0.58,0.9,0.58,0.15,0.2,0.8,0.25,35
XF 50mm f/2 R WR,Fixed,50,2,No,200,46,X-mount,0.3,0.62,0.82,0.3,0.25,0.65,0.3,39
XF 56mm f/1.2 R WR,Fixed,56,1.2,No,445,62,X-mount,0.2,0.3,0.95,0.35,0.25,0.6,0.88,70
XF 60mm f/2.4 Macro,Fixed,60,2.4,No,215,39,X-mount,0.2,0.25,0.8,0.25,0.95,0.3,0.2,26.7
XF 90mm f/2 R LM WR,Fixed,90,2,No,540,62,X-mount,0.2,0.25,0.92,0.7,0.3,0.3,0.85,60
XC 15-45mm f/3.5-5.6 OIS PZ,Zoom,15-45,3.5,Yes,135,52,X-mount,0.82,0.92,0.3,0.2,0.25,0.62,0.65,13
XF 16-50mm f/2.8-4.8 R LM WR,Zoom,16-50,2.8,No,240,58,X-mount,0.85,0.88,0.65,0.3,0.25,0.65,0.82,30
XF 16-55mm f/2.8 R LM WR,Zoom,16-55,2.8,No,655,77,X-mount,0.88,0.6,0.82,0.35,0.25,0.62,0.85,30
XF 16-55mm f/2.8 R LM WR II,Zoom,16-55,2.8,No,410,77,X-mount,0.92,0.7,0.85,0.4,0.25,0.65,0.9,30
XF 16-80mm f/4 R OIS WR,Zoom,16-80,4,Yes,440,72,X-mount,0.88,0.95,0.62,0.65,0.3,0.65,0.92,35
XF 18-55mm f/2.8-4 R LM OIS,Zoom,18-55,2.8,Yes,310,58,X-mount,0.82,0.88,0.6,0.3,0.25,0.62,0.8,30
XF 50-140mm f/2.8 R LM OIS WR,Zoom,50-140,2.8,Yes,995,72,X-mount,0.3,0.25,0.88,0.95,0.25,0.2,0.92,100
XF 55-200mm f/3.5-4.8 R LM OIS,Zoom,55-200,3.5,Yes,580,62,X-mount,0.65,0.62,0.65,0.82,0.3,0.25,0.8,110
XF 100-400mm f/4.5-5.6 R LM OIS,Zoom,100-400,4.5,Yes,1375,77,X-mount,0.68,0.3,0.2,0.98,0.25,0.2,0.85,175
XF 200mm f/2 OIS WR,Fixed,200,2,Yes,2265,43,X-mount,0.25,0.2,0.85,0.98,0.25,0.15,0.95,180
FX 500mm f/5.6 R LM OIS WR,Fixed,500,5.6,Yes,1375,77,X-mount,0.7,0.25,0.15,0.98,0.25,0.15,0.88,300
GF 23mm f/4 R LM WR,Fixed,23,4,No,845,82,G-mount,0.95,0.6,0.2,0.15,0.25,0.65,0.62,38
GF 30mm f/3.5 R WR,Fixed,30,3.5,No,510,62,G-mount,0.85,0.65,0.25,0.2,0.25,0.82,0.6,32
GF 32-64mm f/4 R LM WR,Zoom,32-64,4,No,875,77,G-mount,0.92,0.8,0.62,0.3,0.25,0.65,0.82,50
GF 100-200mm f/5.6 R LM OIS WR,Zoom,100-200,5.6,Yes,1050,72,G-mount,0.68,0.6,0.65,0.85,0.3,0.25,0.8,120
Viltrox AF 23mm f/1.4 for Fujifilm,Fixed,23,1.4,No,320,52,X-mount,0.62,0.65,0.82,0.25,0.25,0.85,0.65,25
TTArtisan 23mm f/1.8,Fixed,23,1.8,No,200,49,X-mount,0.6,0.68,0.58,0.2,0.25,0.82,0.2,20
TTArtisan 27mm f/2.8,Fixed,27,2.8,No,100,39,X-mount,0.58,0.9,0.55,0.15,0.2,0.8,0.2,35
TTArtisan 35mm f/1.8,Fixed,35,1.8,No,220,52,X-mount,0.6,0.65,0.82,0.25,0.25,0.85,0.62,35
TTArtisan 56mm f/1.8,Fixed,56,1.8,No,300,52,X-mount,0.2,0.3,0.8,0.3,0.25,0.62,0.6,50"""
        specs_dfs['lenses'] = pd.read_csv(StringIO(lenses_data))

        # Drones (giữ nguyên dữ liệu của bạn)
        drones_data = """Model,Weight (gram),Max Flight Time (minutes),Control Range (km),Camera Resolution,Frames Per Sec, Obstacle Avoidance Sensor,Folded Size (mm),Tracking,Orbit Mode,Auto Rotation,Wind Resistance,Battery Capability (mAh),Maximum Flight Speed (km/h),Vertical Video Recording,Stability,Sports,Travel,Vlogging,Professional,Easy Of Use
DJI Flip,249,25,13,4K,30fps,"Downward,  Front-facing",138 x 81 x 58,Yes,Yes,No,Level 5 wind (38.5 km/h),2450,50,Yes,0.75,0.55,0.85,0.82,0.5,0.88
DJI Mini 3,249,38,10,4K,30fps,No,148 x 94 x 64,Yes,Yes,No,Level 5 wind (38.5 km/h),2450,57,Yes,0.7,0.4,0.82,0.78,0.45,0.8
DJI Mini 4 Pro,249,30,20,4K,60fps,Omnidirectional,148 x 94 x 64,Yes,Yes,Yes,Level 5 wind (38.5 km/h),2450,58,Yes,0.8,0.6,0.88,0.85,0.65,0.85
DJI Air 3S,720,46,20,4K,120fps,"Downward,  Front-facing",183 x 253 x 77,Yes,Yes,Yes,Level 5 wind (38.5 km/h),3500,76,No,0.88,0.78,0.7,0.8,0.85,0.75
DJI Neo,300,30,6,4K,30fps,"Downward,  Front-facing",140 x 82 x 57,Yes,Yes,No,Level 5 wind (38.5 km/h),2600,28,Yes,0.6,0.3,0.8,0.72,0.3,0.9
DJI Avata 2,410,21,10,4K,60fps,Omnidirectional,180 x 180 x 80,Yes,Yes,Yes,Level 5 wind (38.5 km/h),2420,97,No,0.72,0.85,0.5,0.6,0.55,0.65
DJI Mini 4K,249,30,10,4K,30fps,"Downward,  Front-facing",148 x 94 x 64,Yes,Yes,No,Level 5 wind (38.5 km/h),2450,54,Yes,0.68,0.35,0.8,0.7,0.4,0.82
DJI Mavic 3 Pro,895,43,15,5.1K,50fps,Omnidirectional,231 x 98 x 95,Yes,Yes,Yes,Level 6 wind (50 km/h),5000,69,No,0.92,0.88,0.65,0.78,0.95,0.7
DJI Air 2S,595,31,12,5.4K,30fps,"Downward,  Forward, Backward",183 x 253 x 77,Yes,Yes,Yes,Level 5 wind (38.5 km/h),3500,68,No,0.82,0.72,0.72,0.75,0.8,0.72
DJI Mavic 3 Classic,895,46,15,5.1K,50fps,No,231 x 98 x 95,Yes,Yes,Yes,Level 6 wind (50 km/h),5000,69,No,0.88,0.82,0.68,0.72,0.9,0.7"""
        specs_dfs['drones'] = pd.read_csv((StringIO(drones_data)))

        # Gimbals (giữ nguyên dữ liệu của bạn)
        gimbals_data = """Model,Maximum Payload (kg),Battery Life (hours),Number of Stabilization Axes,Device Compatibility,Time-lapse,Follow Mode,App Connectivity,Folded Size (mm),Stability,Travel,Vlogging,Professional,Easy Of Use
Osmo Mobile 7,0.3,10,3,phone,Yes,Yes,Yes,290 x 110 x 50,0.9,0.88,0.92,0.55,0.88
Osmo Mobile 6,0.3,6,3,phone,Yes,Yes,Yes,290 x 110 x 50,0.85,0.85,0.88,0.5,0.82
Osmo Mobile SE,0.3,8,3,phone,Yes,Yes,Yes,290 x 110 x 50,0.8,0.82,0.82,0.45,0.85
RS4 Mini,2,10,3,small camera,Yes,Yes,Yes,340 x 250 x 70,0.78,0.7,0.75,0.8,0.75
RS4 Pro,4.5,12,3,full-frame camera,Yes,Yes,Yes,340 x 250 x 70,0.95,0.5,0.65,0.98,0.7
RS4,3,11,3,full-frame camera,Yes,Yes,Yes,340 x 250 x 70,0.92,0.55,0.68,0.95,0.72
RS3 Pro,4.5,12,3,full-frame camera,Yes,Yes,Yes,340 x 250 x 70,0.93,0.52,0.66,0.96,0.71"""
        specs_dfs['gimbals'] = pd.read_csv(StringIO(gimbals_data))

        # Action Cameras (giữ nguyên dữ liệu của bạn)
        action_cameras_data = """Model,Weight (gram),Video Recording Capabilities,Time-lapse,Slow Motion,Dimensions (mm),Battery Life (minutes),Touchscreen,Dual Screen,Wifi,Bluetooth,USB-C,Shock Resistance,Water Resistance,Stability,Travel,Sports,Vlogging,Durability,Easy Of Use,Low-light Performance
Osmo Pocket 3,179,4K/120fps,Yes,Yes,140 x 40 x 30,140,Yes,No,Yes,Yes,Yes,No,No,0.92,0.9,0.6,0.95,0.5,0.9,0.85
Osmo Pocket 2,117,4K/60fps,Yes,Yes,124 x 35 x 30,140,Yes,No,Yes,Yes,Yes,No,No,0.88,0.85,0.55,0.8,0.45,0.82,0.65
Osmo Action 5,145,"5.3K/60fps, 4K/120fps",Yes,Yes,70.5 x 44.2 x 32.8,160,Yes,Yes,Yes,Yes,Yes,Yes,20m,0.85,0.75,0.9,0.78,0.95,0.8,0.9
Osmo Action 4,145,4K/120fps,Yes,Yes,70.5 x 44.2 x 32.8,160,Yes,Yes,Yes,Yes,Yes,Yes,18m,0.82,0.72,0.88,0.75,0.92,0.78,0.88
Osmo Action 3,145,4K/120fps,Yes,Yes,70.5 x 44.2 x 32.8,160,Yes,Yes,Yes,Yes,Yes,Yes,16m,0.8,0.7,0.85,0.7,0.9,0.75,0.8
Osmo Action 2,56,4K/60fps,Yes,Yes,39 x 39 x 22,70,Yes,No,Yes,Yes,Yes,Yes,10m,0.75,0.65,0.8,0.65,0.88,0.7,0.75"""
        specs_dfs['action_cameras'] = pd.read_csv(StringIO(action_cameras_data))
        

        # 3. Tiền xử lý dữ liệu cho từng danh mục
        for category, specs_df in specs_dfs.items():

            specs_df['Model'] = specs_df['Model'].str.strip().str.lower()

            # Mã hóa các cột Yes/No
            yes_no_cols = [
                "Quality 4K", "Flipscreen", "Film Simulation", "External Mic Input", "Optical Viewfinder", "Electronic Viewfinder (EVF)", "USB-C", "Wifi", "Bluetooth", "IBIS",
                "Weathersealing", "Rangefinder-style",  
                "Image Stabilization (OIS)", "Tracking", "Orbit Mode", "Auto Rotation", "Vertical Video Recording",
                "Time-lapse", "Follow Mode", "App Connectivity",
                "Slow Motion", "Dual Screen", "Shock Resistance", "Water Resistance",
            ]
            for col in yes_no_cols:
                if col in specs_df.columns:
                    specs_df[col] = specs_df[col].str.strip().str.capitalize().map({'Yes': 1, 'No': 0}).fillna(0).astype('int')

            # Chuẩn hóa cột số
            numeric_cols = [
                "Weight (gram)", "Resolution (MP)", "ISO Min", "ISO Max", 
                "Burst Shooting (fps)", "Battery Life (frames)", "Focal Length (mm)", 
                "Max Aperture", "Minimum Focusing Distance (mm)", "Max Flight Time (minutes)", 
                "Control Range (km)", "Battery Capability (mAh)", "Maximum Flight Speed (km/h)", 
                "Maximum Payload (kg)", "Battery Life (hours)", "Battery Life (minutes)", 
                "Number of Stabilization Axes"
            ]
            for col in numeric_cols:
                if col in specs_df.columns:
                    specs_df[col] = pd.to_numeric(specs_df[col], errors='coerce')
                    specs_df[col] = specs_df[col].fillna(0)

            # Merge với Inventory
            inventory_df_unique = inventory_df.drop_duplicates(subset=['Model']) 

            specs_df = pd.merge(
                specs_df,
                inventory_df_unique[['Model', 'Price', 'Colour', 'Condition', 'Series', 'Free Gift']],
                on='Model',
                how='inner'  
            )

            specs_df['Colour'] = specs_df['Colour'].fillna('black').str.lower()

            specs_dfs[category] = specs_df
           # specs_df.to_csv(f'{category}_specs_log.csv', index=False)
        return specs_dfs

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi tải dữ liệu: {str(e)}")


# Hàm xử lý filter cho từng category
def apply_filters(df: pd.DataFrame, category: str, criteria: Dict[str, Any]) -> pd.DataFrame:
    # Lọc theo tình trạng (condition) cho tất cả các category
    if 'Condition' in criteria and criteria['Condition']:
        condition = criteria['Condition'].lower()
        if condition in ['new', 'used']:
            df = df[df['Condition'].str.lower() == condition] # Thêm lọc màu sắc cho cameras và lenses
    # Lọc màu
    if category in ['cameras', 'lenses'] and 'Colour' in criteria and criteria['Colour']:
        df = df[df['Colour'] == criteria['Colour'].lower()]
    # Lọc theo category
    if category == 'cameras':
        # Weight, done
        if 'Weight' in criteria:
            weight_map = {
                'Light': (None, 400),
                'Medium': (400, 600),
                'Heavy': (600, None)
            }
            min_w, max_w = weight_map[criteria['Weight']]
            if min_w: df = df[df['Weight (gram)'] >= min_w]
            if max_w: df = df[df['Weight (gram)'] <= max_w]
        

        # Design Style, done
        if 'Design Style' in criteria:
            df = df[df['Design Style'] == criteria['Design Style']]
        
        # Resolution, done
        if 'Resolution' in criteria:
            res_map = {
                'Below 20MP': (None, 20),
                '20-30MP': (20, 30),
                'Above 30MP': (30, None)
            }
            min_res, max_res = res_map[criteria['Resolution']]
            if min_res: df = df[df['Resolution (MP)'] >= min_res]
            if max_res: df = df[df['Resolution (MP)'] <= max_res]

        # 4K Video, done
        if '4K Video' in criteria:
            k_map = {
                'Yes': 1,
                'No': 0
            }
            df = df[df['Quality 4K'] == k_map[criteria['4K Video']]]
    
        # df.to_csv(f'{category}_specs_log.csv', index=False)
        
        # ISO Max
        if 'ISO Max' in criteria:
            iso_map = {
                'General': (None, 12800),
                'High': (12800, None)
            }
            min_iso, max_iso = iso_map[criteria['ISO Max']]
            if min_iso: df = df[df['ISO Max'] > min_iso]
            if max_iso: df = df[df['ISO Max'] <= max_iso]

            df.to_csv(f'{category}_specs_log.csv', index=False)
        
        # Flipscreen
        if 'Flipscreen' in criteria:
            if criteria['Flipscreen'] == 'Yes':
                df = df[df['Flipscreen'] == 1]
                if 'Flipscreen Type' in criteria:
                    df = df[df['Flipscreen Type'] == criteria['Flipscreen Type']]
            else:
                df = df[df['Flipscreen'] == 0]

        # Viewfinder
        if 'Optical Viewfinder' in criteria:
            df = df[df['Optical Viewfinder'] == (1 if criteria['Optical Viewfinder'] == 'Yes' else 0)]
        if 'Electronic Viewfinder (EVF)' in criteria:
            df = df[df['Electronic Viewfinder (EVF)'] == (1 if criteria['Electronic Viewfinder (EVF)'] == 'Yes' else 0)]

        # Special Features
        special_features = {
            'Weathersealing': 'Weathersealing',
            'IBIS': 'IBIS',
            'USB-C': 'USB-C'
        }
        for feature, col in special_features.items():
            if feature in criteria and criteria[feature]:
                df = df[df[col] == 1]
    # done filter camera
    elif category == 'lenses':
        # Lens Type
        if 'Lens Type' in criteria:
            df = df[df['Lens Type'] == criteria['Lens Type']]
        
        # Max Aperture
        if 'Max Aperture' in criteria:
            aperture_map = {
                'Wide': (1.0, 1.8),
                'Medium': (2, 2.8),
                'Narrow': (3.5, 5.6)
            }
            min_ap, max_ap = aperture_map[criteria['Max Aperture']]
            if min_ap: df = df[df['Max Aperture'] >= min_ap]
            if max_ap: df = df[df['Max Aperture'] <= max_ap]

        # OIS
        if 'OIS' in criteria:
            df = df[df['Image Stabilization (OIS)'] == (1 if criteria['OIS'] == 'Yes' else 0)]

    # done filter lens

    elif category == 'drones':
        # Weight
        if 'Weight' in criteria:
            weight_map = {
                'Light': (None, 250),
                'Medium': (250, 900)
            }
            min_w, max_w = weight_map[criteria['Weight']]
            if min_w: df = df[df['Weight (gram)'] >= min_w]
            if max_w: df = df[df['Weight (gram)'] < max_w]

        # Max Flight Time
        if 'Max Flight Time' in criteria:
            flight_time_map = {
                'General': (20, 30),
                'Long': (30, None)
            }
            min_ft, max_ft = flight_time_map[criteria['Max Flight Time']]
            if min_ft: df = df[df['Max Flight Time (minutes)'] > min_ft]
            if max_ft: df = df[df['Max Flight Time (minutes)'] <= max_ft]

        # Camera Resolution
        if 'Camera Resolution' in criteria:
            df = df[df['Camera Resolution'] == criteria['Camera Resolution']]
        
        # # Frames per sec
        if 'Frames Per Sec' in criteria:
            df = df[df['Frames Per Sec'] == criteria['Frames Per Sec']]

        # Obstacle Avoidance Sensor
        if 'Obstacle Avoidance Sensor' in criteria:
            sensor_criteria = criteria['Obstacle Avoidance Sensor']
            
            if 'Obstacle Avoidance Sensor' in df.columns:
                if sensor_criteria == 'Yes':
                    df = df[df['Obstacle Avoidance Sensor'].str.strip().str.lower() != 'no']
                elif sensor_criteria == 'No':
                    df = df[df['Obstacle Avoidance Sensor'].str.strip().str.lower() == 'no']

        
        # Maximum Flight Speed
        if 'Maximum Flight Speed (km/h)' in criteria:
            speed_map = {
                'Slow': (None, 36),
                'Moderate': (36, 54),
                'Fast': (54, 72),
                'Very Fast': (72, None)
            }
            min_speed, max_speed = speed_map[criteria['Maximum Flight Speed (km/h)']]
            if min_speed: df = df[df['Maximum Flight Speed (km/h)'] >= min_speed]
            if max_speed: df = df[df['Maximum Flight Speed (km/h)'] <= max_speed]

        # Control Range
        if 'Control Range (km)' in criteria:
            range_map = {
                'Short': (None, 9),
                'Medium': (10, 15),
                'Long': (15, None)
            }
            min_range, max_range = range_map[criteria['Control Range (km)']]
            if min_range: df = df[df['Control Range (km)'] >= min_range]
            if max_range: df = df[df['Control Range (km)'] <= max_range]

        # Special Features
        special_features = {
            'Tracking': 'Tracking',
            'Orbit Mode': 'Orbit Mode',
            'Vertical Video Recording': 'Vertical Video Recording'
        }
        for feature, col in special_features.items():
            if feature in criteria and criteria[feature]:
                df = df[df[col] == 1]

    # done filter drone
    
    elif category == 'gimbals':
        # Maximum Payload
        if 'Maximum Payload (kg)' in criteria:
            payload_map = {
                '0.3kg': (None, 0.3),
                '0.3-2kg': (0.3, 2),
                'Above 2kg': (2, None)
            }
            
            if criteria['Maximum Payload (kg)'] in payload_map:
                min_payload, max_payload = payload_map[criteria['Maximum Payload (kg)']]
                
                if 'Maximum Payload (kg)' in df.columns:
                    df['Maximum Payload (kg)'] = pd.to_numeric(df['Maximum Payload (kg)'], errors='coerce')

                    if min_payload is not None:
                        df = df[df['Maximum Payload (kg)'] > min_payload]
                    if max_payload is not None:
                        df = df[df['Maximum Payload (kg)'] <= max_payload]

        # Battery Life
        if 'Battery Life (hours)' in criteria:
            battery_map = {
                'Below 10h': (None, 10),
                'Above 10h': (11, None)
            }
            min_battery, max_battery = battery_map[criteria['Battery Life (hours)']]
            if min_battery: df = df[df['Battery Life (hours)'] >= min_battery]
            if max_battery: df = df[df['Battery Life (hours)'] <= max_battery]

        # Device Compatibility
        if 'Device Compatibility' in criteria:
            df = df[df['Device Compatibility'] == criteria['Device Compatibility'].lower()]

        # Special Features
        special_features = {
            'Time-lapse': 'Time-lapse',
            'Follow Mode': 'Follow Mode',
            'App Connectivity': 'App Connectivity'
        }
        for feature, col in special_features.items():
            if feature in criteria and criteria[feature]:
                df = df[df[col] == 1]

    # done gimbal filter
    elif category == 'action_cameras':
        # Weight
        if 'Weight' in criteria:
            weight_map = {
                'Light': (None, 100),
                'Medium': (100,None)
            }
            min_w, max_w = weight_map[criteria['Weight']]
            if min_w: df = df[df['Weight (gram)'] >= min_w]
            if max_w: df = df[df['Weight (gram)'] <= max_w]
        

        # Video Recording Capabilities
        if 'Video Recording Capabilities' in criteria:
            selected_capability = criteria['Video Recording Capabilities']
            df = df[df['Video Recording Capabilities'].str.contains(selected_capability, na=False)]

        # Battery Life
        if 'Battery Life (minutes)' in criteria:
            battery_map = {
                'Below 100 minutes': (None, 100),
                '100-150 minutes': (100, 150),
                'Above 150 minutes': (150, None)
            }
            min_battery, max_battery = battery_map[criteria['Battery Life (minutes)']]
            if min_battery: df = df[df['Battery Life (minutes)'] >= min_battery]
            if max_battery: df = df[df['Battery Life (minutes)'] <= max_battery]

        # Special Features
        special_features = {
            'Time-lapse': 'Time-lapse',
            'Slow Motion': 'Slow Motion',
            'Water Resistance': 'Water Resistance',
            'Shock Resistance': 'Shock Resistance'
        }
        for feature, col in special_features.items():
            if feature in criteria and criteria[feature]:
                df = df[df[col] == 1]

    # Lọc giá
    price_range = criteria.get('price')
    if isinstance(price_range, list) and len(price_range) == 2:
        min_price, max_price = price_range
    else:
        min_price, max_price = df['Price'].min(), df['Price'].max()
    
    min_price = int(price_range[0])
    max_price = int(price_range[1])

    df = df[(df['Price'] >= min_price) & (df['Price'] <= max_price)]

    return df

def calculate_scores(df: pd.DataFrame, category: str, selected_purposes: List[str]) -> pd.DataFrame:
    valid_purposes = PURPOSES_PER_CATEGORY.get(category, [])
    
    df_copy = df.copy()
    
    df_copy.columns = df_copy.columns.str.lower()
    
    selected_purposes_lower = [p.lower() for p in selected_purposes]
    valid_purposes_lower = [p.lower() for p in valid_purposes]
    
    purposes_to_use = []
    for p in selected_purposes_lower:
        if p in valid_purposes_lower and p in df_copy.columns:
            if pd.api.types.is_numeric_dtype(df_copy[p]):
                purposes_to_use.append(p)
            else:
                print(f"Warning: Column '{p}' is not numeric and will be ignored for scoring.")
    
    if not purposes_to_use:
        
        df_copy['score'] = 0  
    else:
        
        for purpose in purposes_to_use:
            value_counts = df_copy[purpose].value_counts().head(5)
            
            if df_copy[purpose].isna().any():
                df_copy[purpose] = df_copy[purpose].fillna(0)
        
        try:
            df_copy['score'] = df_copy[purposes_to_use].astype(float).mean(axis=1)
            
            score_stats = {
                "min": df_copy['score'].min(),
                "max": df_copy['score'].max(),
                "mean": df_copy['score'].mean(),
                "median": df_copy['score'].median()
            }
            print(f"Score statistics: {score_stats}")
            
            if df_copy['score'].max() == 0 and len(purposes_to_use) > 0:
                print("Warning: All scores are 0. Check if purpose columns contain only zeros.")
                for purpose in purposes_to_use:
                    if df_copy[purpose].max() == 0:
                        print(f"Column '{purpose}' contains only zeros.")
        except Exception as e:
            print(f"Error calculating scores: {e}")
            df_copy['score'] = 0
    
    df_copy['score'] = df_copy['score'].fillna(0)
        
    return df_copy

# API endpoint
@app.post("/recommend")
async def recommend(request: RecommendationRequest):
    try:
        specs_dfs = load_data()
        category = request.category.lower()
        
        if category not in specs_dfs:
            raise HTTPException(status_code=400, detail="Invalid category")
        
        df = specs_dfs[category].copy()
        
        # Apply filters
        filtered_df = apply_filters(df, category, request.criteria)
        
        # Calculate scores based on purposes
        selected_purposes = request.criteria.get('purposes', [])
        scored_df = calculate_scores(filtered_df, category, selected_purposes)
        
        # Sort and get top products
        top_products = scored_df.sort_values('score', ascending=False)
        
        if top_products.empty:
            return {'message': 'Không tìm thấy sản phẩm phù hợp'}
        
        # Format response
        recommendations = []
        for _, row in top_products.iterrows():
            row = row.rename(str.lower)

            # Get product details for prompt
            product_model = row.get('model', 'unknown')
            product_price = row.get('price', 'N/A')
            product_details = {col: row[col] for col in row.index if col not in ['model', 'price', 'score', 'colour', 'condition', 'series', 'free gift']}
            
            # Generate explanation based on product features and purposes
            explanation = generate_explanation(product_model, selected_purposes, product_details, product_price)
            
            rec = {
                'model': product_model,
                'price': product_price,
                'score': round(row.get('score', 0), 2),
                'colour': row.get('colour', 'black'),
                'series': row.get('series', ''),
                'condition': row.get('condition', 'unknown'),
                'free_gift': row.get('free gift', 'none'),
                'details': product_details,
                'explanation': explanation  
            }
            recommendations.append(rec)

        return {'recommendations': recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

def generate_explanation(product_model, selected_purposes, features, price=None):    
    if not selected_purposes:
        return f"{product_model} là sản phẩm phù hợp với các nhu cầu cơ bản của bạn."
    
    criteria_map = {
        "Beginner": {"Price": "≤23000000", "Resolution": "16-24 MP", "Weight": "≤500g", "Flipscreen": "Yes"},
        "Professional": {"Resolution": "≥26 MP", "ISO Max": "≥12800", "Autofocus Type": "Hybrid", 
                        "Weathersealing": "Yes", "Burst Shooting": "≥10 fps"},
        "Sports": {"Burst Shooting": "≥10 fps", "Autofocus Type": "Hybrid", 
                  "Weathersealing": "Yes", "Battery Life": "≥400 frames"},
        "Video": {"Quay 4K": "Yes", "External Mic Input": "Yes", "IBIS": "Yes", 
                 "Flipscreen": "Yes", "Film Simulation": "Yes"},
        "Daily use": {"Weight": "≤500g", "Battery Life": "≥300 frames", 
                     "WiFi": "Yes", "Bluetooth": "Yes"},
        "Travel": {"Weight": "≤500g", "Battery Life": "≥400 frames", 
                  "Weathersealing": "Yes", "Film Simulation": "Yes"},
        "Vlogging": {"Flipscreen": "Yes", "Weight": "≤500g", "External Mic Input": "Yes", 
                    "Quay 4K": "Yes", "IBIS": "Yes"},
        "Studio": {"Resolution": "≥26 MP", "Film Simulation": "Yes", 
                  "USB-C": "Yes", "Weathersealing": "Yes"}
    }
    
    for purpose in selected_purposes:
        print(f"DEBUG - Criteria for {purpose}: {criteria_map.get(purpose, {})}")
    
    feature_mapping = {
        "resolution": "Resolution",
        "weight": "Weight",
        "flipscreen": "Flipscreen",
        "iso max": "ISO Max",
        "autofocus type": "Autofocus Type",
        "weathersealing": "Weathersealing",
        "burst shooting": "Burst Shooting",
        "battery life": "Battery Life",
        "quay 4k": "Quay 4K",
        "external mic input": "External Mic Input",
        "ibis": "IBIS",
        "film simulation": "Film Simulation",
        "wifi": "WiFi",
        "bluetooth": "Bluetooth",
        "usb-c": "USB-C"
    }
    
    normalized_features = {}
    for key, value in features.items():
        normalized_key = feature_mapping.get(key.lower(), key)
        normalized_features[normalized_key] = value
    
    
    all_matching_features = {}
    
    for purpose in selected_purposes:
        print(f"DEBUG - Processing purpose: {purpose}")
        selected_criteria = criteria_map.get(purpose, {})
        
        for criterion, expected_value in selected_criteria.items():
            
            if criterion in normalized_features:
                actual_value = normalized_features[criterion]
                
                if criterion in all_matching_features:
                    continue

                if criterion == "Price" and price:
                    try:
                        price_value = float(price)
                        threshold_str = expected_value.replace("≤", "").replace("USD", "").strip()
                        
                        threshold = float(threshold_str)
                        
                        if price_value <= threshold:
                            all_matching_features[criterion] = price
                    except Exception as e:
                        print(f"DEBUG - Error processing price: {e}")
                    continue
                
                if "≤" in expected_value:
                    try:
                        actual_num = float(actual_value)
                        threshold = float(expected_value.replace("≤", "").replace("g", "").replace(" frames", "").strip())
                        if actual_num <= threshold:
                            all_matching_features[criterion] = actual_value
                    except Exception as e:
                        print(f"DEBUG - Error processing ≤ comparison: {e}")
                    continue
                
                if "≥" in expected_value:
                    try:
                        actual_num = float(actual_value)
                        threshold = float(expected_value.replace("≥", "").replace(" MP", "").replace(" fps", "").replace(" frames", "").strip())
                        if actual_num >= threshold:
                            all_matching_features[criterion] = actual_value
                    except Exception as e:
                        print(f"DEBUG - Error processing ≥ comparison: {e}")
                    continue
                
                if expected_value == "Yes":
                    if str(actual_value).lower() == "yes" or str(actual_value).lower() == "true" or str(actual_value) == "1":
                        all_matching_features[criterion] = actual_value
                    continue
                
                if criterion == "Resolution" and "MP" in str(actual_value):
                    try:
                        actual_mp = float(actual_value.replace("MP", "").strip())
                        if "16-24" in expected_value and 16 <= actual_mp <= 24:
                            all_matching_features[criterion] = actual_value
                        elif "≥26" in expected_value and actual_mp >= 26:
                            all_matching_features[criterion] = actual_value
                    except Exception as e:
                        print(f"DEBUG - Error processing Resolution: {e}")
                    continue
    
    
    explanation = ""
    
    if len(selected_purposes) == 1:
        primary_purpose = selected_purposes[0]
        adjective_map = {
            "Beginner": "phù hợp cho người mới",
            "Professional": "lý tưởng cho chuyên nghiệp",
            "Sports": "hoàn hảo cho thể thao",
            "Video": "tuyệt vời cho video",
            "Daily use": "phù hợp dùng hàng ngày",
            "Travel": "lý tưởng cho du lịch",
            "Vlogging": "hoàn hảo cho vlogging",
            "Studio": "phù hợp cho studio"
        }
        purpose_desc = adjective_map.get(primary_purpose, f"phù hợp cho {primary_purpose.lower()}")
        explanation += purpose_desc
    else:
        purpose_descriptions = []
        for purpose in selected_purposes:
            purpose_desc_map = {
                "Beginner": "người mới",
                "Professional": "chuyên nghiệp",
                "Sports": "thể thao",
                "Video": "quay video",
                "Daily use": "sử dụng hàng ngày",
                "Travel": "du lịch",
                "Vlogging": "vlogging",
                "Studio": "studio"
            }
            purpose_descriptions.append(purpose_desc_map.get(purpose, purpose.lower()))
        
        if len(purpose_descriptions) > 1:
            multi_purpose_desc = f"phù hợp cho {', '.join(purpose_descriptions[:-1])} và {purpose_descriptions[-1]}"
            explanation += multi_purpose_desc
        else:
            explanation += f"phù hợp cho {purpose_descriptions[0]}"
    
    feature_descriptions = []
    
    if "Beginner" in selected_purposes and price < 23000000:
        price_desc = f"giá {int(price)} đồng"
        feature_descriptions.append(price_desc)

    for criterion, actual_value in all_matching_features.items():
        if criterion == "Price":
            continue
    
    for criterion, actual_value in all_matching_features.items():
        if criterion == "Price":
            continue
            
        desc = None
        if criterion == "Resolution":
            desc = f"độ phân giải {actual_value}"
        elif criterion == "Weight":
            desc = f"trọng lượng {actual_value}g"
        elif criterion == "Battery Life":
            desc = f"pin {actual_value} khung hình"
        elif criterion == "Burst Shooting":
            desc = f"chụp liên tục {actual_value} fps"
        elif criterion == "ISO Max":
            desc = f"ISO tối đa {actual_value}"
        elif criterion == "Weathersealing" and actual_value == 1:
            desc = "chống chịu thời tiết"
        elif criterion == "Autofocus Type" and str(actual_value).lower() == "hybrid":
            desc = "lấy nét Hybrid"
        elif criterion == "Flipscreen" and (actual_value == 1 or str(actual_value).lower() == "yes"):
            desc = "màn hình lật đầy đủ"
        elif criterion == "Quay 4K" and (actual_value == 1 or str(actual_value).lower() == "yes"):
            desc = "quay 4K"
        elif criterion == "External Mic Input" and(actual_value == 1 or str(actual_value).lower() == "yes"):
            desc = "có cổng mic ngoài"
        elif criterion == "IBIS" and (actual_value == 1 or str(actual_value).lower() == "yes"):
            desc = "chống rung IBIS"
        elif criterion == "Film Simulation" and(actual_value == 1 or str(actual_value).lower() == "yes"):
            desc = "có Film Simulation"
        elif criterion == "WiFi" and(actual_value == 1 or str(actual_value).lower() == "yes"):
            if "Bluetooth" in normalized_features and ((normalized_features["Bluetooth"]) == 1 or str(normalized_features["Bluetooth"]).lower() == "true"):
                desc = "có WiFi/Bluetooth"
            else:
                desc = "có WiFi"
        elif criterion == "USB-C" and(actual_value == 1 or str(actual_value).lower() == "yes"):
            desc = "USB-C (hỗ trợ tethering)"
        
        if desc:
            feature_descriptions.append(desc)    
    
    if len(feature_descriptions) > 1:
        feature_text = " với " + ", ".join(feature_descriptions[:-1]) + ", và " + feature_descriptions[-1] + "."
        explanation += feature_text
    elif len(feature_descriptions) == 1:
        feature_text = " với " + feature_descriptions[0] + "."
        explanation += feature_text
    else:
        if len(selected_purposes) == 1:
            primary_purpose = selected_purposes[0]
            general_descriptions = {
                "Beginner": "thiết kế dễ sử dụng phù hợp với người mới.",
                "Professional": "chất lượng chuyên nghiệp đáp ứng yêu cầu cao.",
                "Sports": "hiệu suất tối ưu cho chụp thể thao.",
                "Video": "các tính năng chuyên biệt cho quay phim.",
                "Daily use": "thiết kế tiện lợi cho sử dụng hàng ngày.",
                "Travel": "kích thước nhỏ gọn lý tưởng cho du lịch.",
                "Vlogging": "tính năng hoàn hảo cho người làm vlog.",
                "Studio": "chất lượng hình ảnh cao cấp cho công việc studio."
            }
            general_desc = " với " + general_descriptions.get(primary_purpose, "các tính năng phù hợp với nhu cầu của bạn.")
            explanation += general_desc
        else:
            general_multi_desc = " với nhiều tính năng phù hợp cho đa dạng nhu cầu của bạn."
            explanation += general_multi_desc
    
    return explanation

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)