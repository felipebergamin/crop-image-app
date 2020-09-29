const photoFile = document.getElementById("photo-file");
const photoPreview = document.getElementById("photo-preview");
const cropButton = document.getElementById("crop-image");
const downloadButton = document.getElementById("download");
let photoName, image;

// select and preview image

document.getElementById("select-image").addEventListener("click", () => {
  photoFile.click();
});

window.addEventListener("DOMContentLoaded", () => {
  photoFile.addEventListener("change", () => {
    let file = photoFile.files.item(0);

    // read file
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      image = new Image();
      image.src = event.target.result;
      image.onload = onLoadImage;
    };
  });
});

function onLoadImage() {
  const { width, height } = image;
  canvas.width = width;
  canvas.height = height;

  // clear context
  ctx.clearRect(0, 0, width, height);

  // draw image on canvas
  ctx.drawImage(image, 0, 0);
  photoPreview.src = canvas.toDataURL();
}

// selection tool
const selection = document.getElementById("selection-tool");
let startSelection = false;
let startX,
  startY,
  relativeStartX,
  relativeStartY,
  endX,
  endY,
  relativeEndX,
  relativeEndY;

const events = {
  mouseover() {
    this.style.cursor = "crosshair";
  },
  mousedown() {
    const { clientX, clientY, offsetX, offsetY } = event;

    startX = clientX;
    startY = clientY;
    relativeStartX = offsetX;
    relativeStartY = offsetY;

    startSelection = true;
  },
  mousemove() {
    endX = event.clientX;
    endY = event.clientY;

    if (startSelection) {
      selection.style.display = "initial";
      selection.style.top = startY + "px";
      selection.style.left = startX + "px";
      selection.style.width = endX - startX + "px";
      selection.style.height = endY - startY + "px";
    }
  },
  mouseup() {
    startSelection = false;

    relativeEndX = event.layerX;
    relativeEndY = event.layerY;

    // show crop button
    cropButton.style.display = "initial";
  },
};

Object.keys(events).forEach((eventName) => {
  photoPreview.addEventListener(eventName, events[eventName]);
});

// canvas
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

// cortar image
cropButton.onclick = () => {
  const { width: imgW, height: imgH } = image;
  const { width: previewW, height: previewH } = photoPreview;

  const [widthFactor, heightFactor] = [+(imgW / previewW), +(imgH / previewH)];

  const [selectionWidth, selectionHeight] = [
    +selection.style.width.replace("px", ""),
    +selection.style.height.replace("px", ""),
  ];

  const [croppedWidth, croppedHeight] = [
    +(selectionWidth * widthFactor),
    +(selectionHeight * heightFactor),
  ];

  const [actualX, actualY] = [
    +(relativeStartX * widthFactor),
    +(relativeStartY * heightFactor),
  ];

  // pegar do ctx a imagem cortada
  const croppedImage = ctx.getImageData(
    actualX,
    actualY,
    croppedWidth,
    croppedHeight
  );

  // limpar o ctx
  ctx.clearRect(0, 0, ctx.width, ctx.height);

  // ajuste de proporções
  image.width = canvas.width = croppedWidth;
  image.height = canvas.height = croppedHeight;

  // adicionar a imagem cortada ao ctx
  ctx.putImageData(croppedImage, 0, 0);

  // esconder a ferramenta de seleção
  selection.style.display = "none";

  // atualizar o preview da imagem
  photoPreview.src = canvas.toDataURL();

  // mostrar o botão de download
  downloadButton.style.display = "initial";
};

downloadButton.onclick = () => {
  const a = document.createElement("a");
  a.download = photoName + "-cropped.png";
  a.href = canvas.toDataURL();
  a.click();
};
