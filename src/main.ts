import './style.css';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const offscreenCanvas = document.getElementById('offscreen') as HTMLCanvasElement;
const fileDOM = document.getElementById('file') as HTMLInputElement;

const ctx = canvas.getContext('2d')!;
const offscreenCtx = offscreenCanvas.getContext('2d')!;
offscreenCtx.imageSmoothingEnabled = false;
(offscreenCtx as any).mozImageSmoothingEnabled = false;
(offscreenCtx as any).webkitImageSmoothingEnabled = false;
(offscreenCtx as any).msImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
(ctx as any).mozImageSmoothingEnabled = false;
(ctx as any).webkitImageSmoothingEnabled = false;
(ctx as any).msImageSmoothingEnabled = false;

fileDOM.addEventListener('change', e => {
    const files = (e.target as HTMLInputElement).files;
    if (!files?.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.addEventListener('loadend', e => {
        if (e.target?.result) {
            const img = document.createElement('img');
            img.classList.add('obj');
            img.src = e.target?.result as string;
            img.onload = () => {
                offscreenCtx.drawImage(img, 0, 0, 20, 20);
                const smallImg = offscreenCanvas.toDataURL();
                const nimg = new Image();
                nimg.src = smallImg;
                nimg.onload = () => {
                    ctx.drawImage(nimg, 0, 0, 200, 200);
                };
            };
        }
    });
    reader.readAsDataURL(file);
});
