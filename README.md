# PassThemer 🎨

A simple web-based tool for creating custom iPhone passcode themes. Upload your images and generate theme files ready for iOS theming.

[**Live Demo**](https://pass-themer.vercel.app/)

## Features

- **Single Overlay Mode** - Upload one image that gets automatically split into 10 passcode key sections
- **Multiple Overlay Mode** - Upload 10 separate overlay images for each key
- **Scale Slider** - Adjust overlay image size before splitting
- **Transparent Background** - Option to use transparent backgrounds
- **Horizontal/Vertical Split** - Choose how the background photo is divided
- **Passcode Layout Preview** - See your theme in the actual passcode grid layout
- **Multiple Export Formats** - Download as `.zip` or `.passthm`

## Output Specifications

- **Dimensions**: 305×287 px per key
- **Format**: PNG with transparency support
- **Layout**: 3×4 grid matching iPhone passcode (1-9 + 0)

## Usage

1. Upload a background photo (or use transparent background)
2. Upload an overlay image (single or 10 separate)
3. Adjust scale if needed
4. Click "Generate Theme"
5. Download as ZIP or .passthm

## Running Locally

```bash
# Clone the repository
git clone https://github.com/SpyGdev/PassThemer.git
cd PassThemer

# Start a local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

## File Structure

```
PassThemer/
├── index.html      # Main HTML structure
├── styles.css      # Styling
├── app.js          # Application logic
└── README.md       # This file
```

## Download Counter Setup (Vercel) 📊

This project uses **Vercel KV (Redis)** to track downloads. To make it work on your Vercel deployment:

1. Deploy the project to Vercel.
2. In your Vercel Project Dashboard, go to **Storage**.
3. Click **Create Database** → Select **Vercel KV**.
4. **Note:** If you don't see "Vercel KV" listed, go to the **Integration Marketplace** and search for "Upstash" or "Vercel KV".
5. Follow the steps to create a new KV database (free tier is sufficient).
6. Once created, go to your project **Settings** > **Environment Variables**.
7. Ensure the `KV_URL`, `KV_REST_API_URL`, and `KV_REST_API_TOKEN` variables are automatically linked (or add them manually from your KV database details).
7. Redeploy your project for changes to take effect.

## Technologies Used

- HTML5 Canvas API for image processing
- JavaScript (Vanilla)
- CSS3 with glassmorphism effects
- JSZip for archive creation

## Bug Reporting 🐛

Found a bug or have a suggestion? Please [open an issue](https://github.com/SpyGdev/PassThemer/issues) on GitHub.

## License

MIT License

---
I dont give enough shit to handwrite the readme.
Made with ❤️ by [SpyGdev](https://github.com/SpyGdev)
