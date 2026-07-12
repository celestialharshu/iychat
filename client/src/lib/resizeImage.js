// Turns a photo the user picked into a small square JPEG, encoded as a data
// URL string that we can just save on their user document.
//
// Why bother? A photo straight off a phone camera is 3-5 MB. We display it at
// 48px in the chat list and 96px on the profile, so we throw away everything
// we don't need BEFORE uploading. The result is around 20 KB, which is small
// enough to store in Mongo and send along with the conversation list.
//
// The steps are: read the file -> draw the middle square of it onto a canvas
// at the size we want -> ask the canvas for a JPEG.

const SIZE = 256; // final width and height, in pixels
const QUALITY = 0.8; // JPEG quality, 0 to 1

export async function resizeImage(file) {
  const image = await loadImage(file);

  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext("2d");

  // Crop to the middle square so nothing gets squashed. If the photo is a
  // wide landscape shot we take the middle slice of it; if it's a tall
  // portrait we take the middle band.
  const side = Math.min(image.width, image.height);
  const left = (image.width - side) / 2;
  const top = (image.height - side) / 2;

  ctx.drawImage(image, left, top, side, side, 0, 0, SIZE, SIZE);

  return canvas.toDataURL("image/jpeg", QUALITY);
}

// FileReader and Image are both callback-based, so wrap them in promises to
// keep resizeImage above readable as a straight top-to-bottom function.
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Could not read that file"));

    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("That file isn't a valid image"));
      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}
