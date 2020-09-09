// Select and preview

const photoFile = document.getElementById('photo-file');
let photoPreview = document.getElementById('photo-preview');
let image;
let imageName;

const button = document.getElementById('select-image');
button.addEventListener('click', () => {
    photoFile.click();
    });

    window.addEventListener('DOMContentLoaded', () => {
        photoFile.addEventListener('change', () => {
            let file = photoFile.files.item(0);
            imageName = file.name;

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                image = new Image();
                image.src = event.target.result;
                image.onload = onloadImage;
            }
    });
});

// Selection tool

const selection = document.getElementById('selection-tool');
let startX , startY , relativeStartX , relativeStartY , endX , endY , relativeEndX , relativeEndY;

let startSelection = false;

const events = {
    mouseover(){
        this.style.cursor = 'crosshair';
    },
    mousedown(){
        const { clientX, clientY, offsetX, offsetY } = event;
        // console.table({
        //     'client': [clientX, clientY],
        //     'offset': [offsetX, offsetY]
        // });
        startX = clientX;
        startY = clientY;
        relativeStartX = offsetX;
        relativeStartY = offsetY;

        startSelection = true;


    },
    mousemove(){
        endX = event.clientX;
        endY = event.clientY;
        if(startSelection){
            selection.style.display = 'initial';
            selection.style.top = startY + 'px';
            selection.style.left = startX + 'px';
    
            selection.style.width = (endX - startX) + 'px';
            selection.style.height = (endY - startY) + 'px';
        }



    },
    mouseup(){
        startSelection = false;

        relativeEndX = event.layerX;
        relativeEndY = event.layerY;

        cropButton.style.display = 'initial';
    }
}

Object.keys(events).forEach((eventName) => {
   photoPreview.addEventListener(eventName, events[eventName]);
});

// Canvas

let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');

function onloadImage() {
    const { width, height } = image;
    canvas.width = width;
    canvas.height = height;

    // Clear context
    ctx.clearRect(0, 0, width, height);

    // Draw the image on context

    ctx.drawImage(image, 0, 0);

    photoPreview.src = canvas.toDataURL();
}

// Crop image

const cropButton = document.getElementById('crop-image');

cropButton.addEventListener('click', () => {
    const { width: imgW, height: imgH } = image;
    const { width: previewW, height: previewH } = photoPreview;

    const [ widthFactor, heightFactor ] = [
        +(imgW / previewW),
        +(imgH / previewH)
    ]

    const [ selectionWidth, selectionHeight ] = [
        +selection.style.width.replace('px', ''),
        +selection.style.height.replace('px', '')
    ]

    const [ croppedWidth , croppedHeight ] = [
        +(selectionWidth * widthFactor),
        +(selectionHeight + heightFactor)
    ]

    const [ actualX , actualY ] = [
        +(relativeStartX * widthFactor),
        +(relativeStartY * heightFactor)
    ]

    // Get of context the cropped image

    const croppedImage = ctx.getImageData(actualX, actualY, croppedWidth, croppedHeight);
    
    // Clear canvas context

    ctx.clearRect(0, 0, ctx.width, ctx.height);

    // Ajustment of proportions

    image.width = canvas.width = croppedWidth;
    image.height = canvas.height = croppedHeight;

    // add cropped image to canvas context

    ctx.putImageData(croppedImage, 0, 0);

    // hidden selection tool

    selection.style.display = 'none';

    // Refresh image preview

    photoPreview.src = canvas.toDataURL();

    // Show download button
    downloadButton.style.display = 'initial';
})

// Download

const downloadButton = document.getElementById('download');

downloadButton.addEventListener('click', () => {
    const a = document.createElement('a');
    a.download = imageName + '-cropped.png';
    a.href = canvas.toDataURL();
    a.click();
})
