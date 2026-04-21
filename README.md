Nectar is a product-analyzer Chrome extension that provides in-depth information on products’ price points, review integrity, quality, brand reputation, and more, recommending the best option. Our mission is to reduce shoppers’ stress when buying products and provide a more educated shopping experience.

## Clone Repository:
```bash
git clone https://github.com/aagarw56/GDGC-Ballers.git
cd GDGC-Ballers
```
## Backend Setup
Install node.js (http://nodejs.org/en/download) and add to PATH.
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate # Windows
source .venv/bin/activate # Mac/Linux
```
## Create .env in ROOT directory:
```bash
CANOPY_API_KEY="your_api_key_here"
GEMINI_API_KEY="your_api_key_here"
```
## Frontend Setup
```bash
cd frontend
npm install
npm run build
```
## Load Extension
1. Go to chrome://extensions/
2. Enable "Developer mode"
3. Click load unpacked
4. Select GDGC-Ballers/frontend/dist

## Deploying Backend Server
Run this in terminal to run locally:
```bash
uvicorn backend.main:app --reload
```
Or use hosted backend already deployed on Render -- no setup required.
_____________________________________________________________________________________________________________________________________________________
Co-developed by Shivank Virdi, Iyanna Arches, Jaycob Pakingan, Aanya Agarwal, & Kaylana Chaun. We hope you enjoy using our extension!
