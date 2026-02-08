// ===== Constants =====
const OVERLAY_FILENAMES = [
    'en-0---white.png',
    'en-1---white.png',
    'en-2-A B C--white.png',
    'en-3-D E F--white.png',
    'en-4-G H I--white.png',
    'en-5-J K L--white.png',
    'en-6-M N O--white.png',
    'en-7-P Q R S--white.png',
    'en-8-T U V--white.png',
    'en-9-W X Y Z--white.png'
];

const OUTPUT_WIDTH = 305;
const OUTPUT_HEIGHT = 287;

// ===== State =====
let backgroundImage = null;
let overlays = new Map();
let singleOverlayImage = null;
let overlayMode = 'single'; // 'single' or 'multiple'
let splitDirection = 'horizontal';
let generatedImages = [];

// ===== DOM Elements =====
const photoDropZone = document.getElementById('photoDropZone');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const singleOverlayDropZone = document.getElementById('singleOverlayDropZone');
const singleOverlayInput = document.getElementById('singleOverlayInput');
const singleOverlayPreview = document.getElementById('singleOverlayPreview');
const overlaysDropZone = document.getElementById('overlaysDropZone');
const overlaysInput = document.getElementById('overlaysInput');
const overlayChecklist = document.getElementById('overlayChecklist');
const modeButtons = document.querySelectorAll('.mode-btn');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const generateBtn = document.getElementById('generateBtn');
const previewSection = document.getElementById('previewSection');
const previewGrid = document.getElementById('previewGrid');
const downloadBtn = document.getElementById('downloadBtn');
const downloadPassthmBtn = document.getElementById('downloadPassthmBtn');
const transparentBgBtn = document.getElementById('transparentBgBtn');
const scaleSliderContainer = document.getElementById('scaleSliderContainer');
const overlayScaleSlider = document.getElementById('overlayScale');
const scaleValueDisplay = document.getElementById('scaleValue');

// ===== Initialize =====
function init() {
    setupDropZone(photoDropZone, photoInput, handlePhotoUpload);
    setupDropZone(singleOverlayDropZone, singleOverlayInput, handleSingleOverlayUpload);
    setupDropZone(overlaysDropZone, overlaysInput, handleOverlaysUpload);
    setupTransparentBgButton();
    setupOverlayModeToggle();
    setupScaleSlider();
    setupDirectionToggle();
    setupGenerateButton();
    setupDownloadButton();
    setupDownloadPassthmButton();
    renderOverlayChecklist();
}

// ===== Drop Zone Setup =====
function setupDropZone(dropZone, input, handler) {
    dropZone.addEventListener('click', () => input.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        handler(files);
    });

    input.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handler(files);
    });
}

// ===== Photo Upload =====
function handlePhotoUpload(files) {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            backgroundImage = img;
            photoPreview.src = e.target.result;
            photoDropZone.classList.add('has-image');
            transparentBgBtn.classList.remove('active');
            updateGenerateButton();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ===== Transparent Background =====
function setupTransparentBgButton() {
    transparentBgBtn.addEventListener('click', useTransparentBackground);
}

function useTransparentBackground() {
    // Create a transparent canvas as the background
    // Size it to match 10 keys at 300x287 each (3000x287 for horizontal)
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_WIDTH * 10;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext('2d');

    // Leave it transparent (default canvas state)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create an image from the canvas
    const img = new Image();
    img.onload = () => {
        backgroundImage = img;
        photoPreview.src = canvas.toDataURL('image/png');
        photoDropZone.classList.add('has-image');
        transparentBgBtn.classList.add('active');
        updateGenerateButton();
    };
    img.src = canvas.toDataURL('image/png');
}

// ===== Scale Slider =====
function setupScaleSlider() {
    overlayScaleSlider.addEventListener('input', () => {
        scaleValueDisplay.textContent = overlayScaleSlider.value;
    });
}

// ===== Overlays Upload =====
function handleOverlaysUpload(files) {
    const pngFiles = files.filter(f => f.type === 'image/png');

    if (pngFiles.length === 0) {
        alert('Please upload PNG files');
        return;
    }

    let matchedCount = 0;
    let unmatchedFiles = [];

    pngFiles.forEach(file => {
        const filename = file.name;

        // First, try exact match
        if (OVERLAY_FILENAMES.includes(filename)) {
            loadOverlay(file, filename);
            matchedCount++;
            return;
        }

        // Try to match by digit (0-9) in filename
        const digitMatch = filename.match(/(\d)/);
        if (digitMatch) {
            const digit = parseInt(digitMatch[1]);
            if (digit >= 0 && digit <= 9) {
                const targetFilename = OVERLAY_FILENAMES[digit];
                loadOverlay(file, targetFilename);
                matchedCount++;
                return;
            }
        }

        unmatchedFiles.push(filename);
    });

    if (unmatchedFiles.length > 0 && matchedCount === 0) {
        alert(`Could not match overlay files. Expected filenames like:\n${OVERLAY_FILENAMES.slice(0, 3).join('\n')}\n...\n\nOr files containing digits 0-9 in the name.`);
    }
}

function loadOverlay(file, targetFilename) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            overlays.set(targetFilename, img);
            renderOverlayChecklist();
            updateGenerateButton();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ===== Single Overlay Upload =====
function handleSingleOverlayUpload(files) {
    const file = files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert('Please upload a valid image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            singleOverlayImage = img;
            singleOverlayPreview.src = e.target.result;
            singleOverlayDropZone.classList.add('has-image');
            scaleSliderContainer.classList.add('visible');
            updateGenerateButton();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ===== Overlay Mode Toggle =====
function setupOverlayModeToggle() {
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            overlayMode = btn.dataset.mode;

            // Toggle visibility of drop zones
            if (overlayMode === 'single') {
                singleOverlayDropZone.classList.remove('hidden');
                overlaysDropZone.classList.add('hidden');
                overlayChecklist.classList.add('hidden');
            } else {
                singleOverlayDropZone.classList.add('hidden');
                overlaysDropZone.classList.remove('hidden');
                overlayChecklist.classList.remove('hidden');
            }

            updateGenerateButton();
        });
    });
}

// ===== Overlay Checklist =====
function renderOverlayChecklist() {
    overlayChecklist.innerHTML = OVERLAY_FILENAMES.map(filename => {
        const loaded = overlays.has(filename);
        const shortName = filename.replace('en-', '').replace('--white.png', '').replace('-', ': ');
        return `<li class="${loaded ? 'loaded' : ''}">${shortName}</li>`;
    }).join('');
}

// ===== Direction Toggle =====
function setupDirectionToggle() {
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            splitDirection = btn.dataset.direction;
        });
    });
}

// ===== Generate Button =====
function updateGenerateButton() {
    const hasPhoto = backgroundImage !== null;
    let hasOverlay = false;

    if (overlayMode === 'single') {
        hasOverlay = singleOverlayImage !== null;
    } else {
        hasOverlay = overlays.size === 10;
    }

    generateBtn.disabled = !(hasPhoto && hasOverlay);
}

function setupGenerateButton() {
    generateBtn.addEventListener('click', generateTheme);
}

// ===== Core Image Processing =====
function generateTheme() {
    if (!backgroundImage) return;

    generatedImages = [];
    previewGrid.innerHTML = '';

    // Split the photo into 10 slices
    const photoSlices = splitPhoto(backgroundImage, splitDirection);

    // Get overlay slices based on mode
    let overlaySlices;
    if (overlayMode === 'single' && singleOverlayImage) {
        // Auto-detect overlay orientation based on aspect ratio
        const overlayDirection = singleOverlayImage.width >= singleOverlayImage.height ? 'horizontal' : 'vertical';

        // Cut 10 sections of exactly 300x287 from the overlay (no resizing)
        overlaySlices = splitOverlayFixed(singleOverlayImage, overlayDirection);
    } else if (overlayMode === 'multiple' && overlays.size === 10) {
        // Use the individual overlay images
        overlaySlices = OVERLAY_FILENAMES.map(filename => overlays.get(filename));
    } else {
        return;
    }

    // Store all generated images first
    photoSlices.forEach((photoSlice, index) => {
        const filename = OVERLAY_FILENAMES[index];
        const overlaySlice = overlaySlices[index];

        // Resize and crop photo slice to output dimensions
        const resizedPhoto = resizeAndCrop(photoSlice, OUTPUT_WIDTH, OUTPUT_HEIGHT);

        // Use overlay slice as-is (no resizing for overlays to preserve their original content)
        const overlayToUse = overlaySlice;

        // Composite overlay on top
        const final = compositeOverlay(resizedPhoto, overlayToUse, OUTPUT_WIDTH, OUTPUT_HEIGHT);

        // Store result
        generatedImages.push({
            key: index,
            filename: filename,
            dataUrl: final.toDataURL('image/png')
        });
    });

    // Display in passcode order: 1,2,3,4,5,6,7,8,9,0
    const displayOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    displayOrder.forEach(key => {
        const img = generatedImages.find(g => g.key === key);
        if (img) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.dataset.key = key;
            previewItem.innerHTML = `
                <img src="${img.dataUrl}" alt="Key ${key}">
                <div class="label">${key}</div>
            `;
            previewGrid.appendChild(previewItem);
        }
    });

    previewSection.classList.add('visible');
}

function splitPhoto(image, direction) {
    const slices = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (direction === 'horizontal') {
        // Split horizontally (left to right)
        const sliceWidth = image.width / 10;
        canvas.width = sliceWidth;
        canvas.height = image.height;

        for (let i = 0; i < 10; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                image,
                i * sliceWidth, 0, sliceWidth, image.height,
                0, 0, sliceWidth, image.height
            );

            // Create a new canvas for this slice
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = sliceWidth;
            sliceCanvas.height = image.height;
            const sliceCtx = sliceCanvas.getContext('2d');
            sliceCtx.drawImage(canvas, 0, 0);
            slices.push(sliceCanvas);
        }
    } else {
        // Split vertically (top to bottom)
        const sliceHeight = image.height / 10;
        canvas.width = image.width;
        canvas.height = sliceHeight;

        for (let i = 0; i < 10; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                image,
                0, i * sliceHeight, image.width, sliceHeight,
                0, 0, image.width, sliceHeight
            );

            // Create a new canvas for this slice
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = image.width;
            sliceCanvas.height = sliceHeight;
            const sliceCtx = sliceCanvas.getContext('2d');
            sliceCtx.drawImage(canvas, 0, 0);
            slices.push(sliceCanvas);
        }
    }

    return slices;
}

// Split overlay into 10 sections matching passcode grid layout (3x4 grid with 0 centered)
// Layout:  1 2 3
//          4 5 6
//          7 8 9
//            0
function splitOverlayFixed(image, direction) {
    const slices = [];

    // Get scale from slider (default 100%)
    const scale = parseInt(overlayScaleSlider.value) / 100;

    // Scale the image first (round to prevent sub-pixel issues)
    const scaledWidth = Math.round(image.width * scale);
    const scaledHeight = Math.round(image.height * scale);

    // Create scaled version of the image
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = scaledWidth;
    scaledCanvas.height = scaledHeight;
    const scaledCtx = scaledCanvas.getContext('2d');
    scaledCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);

    // Grid layout: 3 columns, 4 rows (last row has only center cell for 0)
    const gridCols = 3;
    const gridRows = 4;
    const totalWidth = OUTPUT_WIDTH * gridCols;   // 900px
    const totalHeight = OUTPUT_HEIGHT * gridRows; // 1148px

    // Calculate offset to center the grid on the scaled image
    // Round to prevent sub-pixel rendering artifacts (transparent lines)
    const offsetX = Math.round((scaledWidth - totalWidth) / 2);
    const offsetY = Math.round((scaledHeight - totalHeight) / 2);

    // Define grid positions for each key (0-9)
    // Key index -> [column, row]
    // Middle column (col 1) keys need 305px width
    const keyPositions = {
        0: [1, 3],  // Center of row 4 (middle column)
        1: [0, 0],  // Row 1
        2: [1, 0],  // Middle column
        3: [2, 0],
        4: [0, 1],  // Row 2
        5: [1, 1],  // Middle column
        6: [2, 1],
        7: [0, 2],  // Row 3
        8: [1, 2],  // Middle column
        9: [2, 2]
    };

    // Generate slices for keys 0-9
    for (let key = 0; key <= 9; key++) {
        const [col, row] = keyPositions[key];

        const canvas = document.createElement('canvas');
        canvas.width = OUTPUT_WIDTH;
        canvas.height = OUTPUT_HEIGHT;
        const ctx = canvas.getContext('2d');

        // Calculate source position on scaled image
        const sx = Math.round(offsetX + (col * OUTPUT_WIDTH));
        const sy = Math.round(offsetY + (row * OUTPUT_HEIGHT));

        // Draw the section from the scaled image
        ctx.drawImage(
            scaledCanvas,
            sx, sy, OUTPUT_WIDTH, OUTPUT_HEIGHT,
            0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT
        );

        slices.push(canvas);
    }

    return slices;
}

function resizeAndCrop(slice, targetWidth, targetHeight) {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    const sourceWidth = slice.width;
    const sourceHeight = slice.height;

    // Calculate scale to cover the target area
    const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);

    // Calculate scaled dimensions
    const scaledWidth = sourceWidth * scale;
    const scaledHeight = sourceHeight * scale;

    // Center the image (crop from center)
    const offsetX = (targetWidth - scaledWidth) / 2;
    const offsetY = (targetHeight - scaledHeight) / 2;

    // Draw with cover behavior
    ctx.drawImage(slice, offsetX, offsetY, scaledWidth, scaledHeight);

    return canvas;
}

function compositeOverlay(base, overlay, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw base image
    ctx.drawImage(base, 0, 0);

    // Draw overlay on top (centered if overlay is different size)
    const overlayX = (width - overlay.width) / 2;
    const overlayY = (height - overlay.height) / 2;
    ctx.drawImage(overlay, overlayX, overlayY);

    return canvas;
}
// ===== Download =====
const exportFilenameInput = document.getElementById('exportFilename');

function getExportFilename(extension) {
    const baseName = exportFilenameInput.value.trim() || 'TelephonyUI-8';
    return `${baseName}.${extension}`;
}

function setupDownloadButton() {
    downloadBtn.addEventListener('click', () => downloadAll(getExportFilename('zip')));
}

async function downloadAll(filename) {
    if (generatedImages.length === 0) return;

    const zip = new JSZip();

    // Add each image to the zip
    for (const img of generatedImages) {
        const base64Data = img.dataUrl.split(',')[1];
        zip.file(img.filename, base64Data, { base64: true });
    }

    // Generate and download zip
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function setupDownloadPassthmButton() {
    downloadPassthmBtn.addEventListener('click', () => downloadAll(getExportFilename('passthm')));
}

// ===== Start =====
init();
