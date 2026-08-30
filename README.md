# Shree Bheemashankar S S K N., Maragur - Sugar Allotment System

Connected Google Spreadsheet Database ID:
`1vy1AtjovBDwPNGxBJfE0PvwfddNe7XUK_-tf5X0ychQ`

Direct Link to Spreadsheet:
https://docs.google.com/spreadsheets/d/1vy1AtjovBDwPNGxBJfE0PvwfddNe7XUK_-tf5X0ychQ/edit

---

## 📁 File Architecture

- **`index.html`** / **`sugar_allotment_app.html`**: Redesigned modern, responsive HTML/CSS/JS frontend application with Tailwind CSS & FontAwesome 6.
- **`Code.gs`**: Complete Google Apps Script backend bound to Spreadsheet ID `1vy1AtjovBDwPNGxBJfE0PvwfddNe7XUK_-tf5X0ychQ`.
- **`server.js`**: Standalone Node.js / Express REST API server.
- **`package.json`**: Node.js dependencies configuration.

---

## 🚀 How to Deploy in Google Apps Script (GAS)

1. Open your Google Spreadsheet:
   https://docs.google.com/spreadsheets/d/1vy1AtjovBDwPNGxBJfE0PvwfddNe7XUK_-tf5X0ychQ/edit
2. Go to **Extensions > Apps Script**.
3. Replace `Code.gs` with the updated [`Code.gs`](file:///C:/Users/New/.gemini/antigravity/scratch/sugar-allotment-ui/Code.gs).
4. Create an HTML file named `index` and paste [`index.html`](file:///C:/Users/New/.gemini/antigravity/scratch/sugar-allotment-ui/index.html).
5. Click **Deploy > New Deployment** (Select *Web app*, Execute as *Me*, Access *Anyone*).
6. Save & Launch! The system will automatically create and populate the required sheets (`Users`, `Shareholders`, `Allotments`, `PairingSessions`).
