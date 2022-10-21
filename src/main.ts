import copy from 'copy-to-clipboard';
import shuffle from 'z-shuffle';

import './style.css';

const imageDOM = document.getElementById('image') as HTMLImageElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const offscreenCanvas = document.getElementById('offscreen') as HTMLCanvasElement;
const fileDOM = document.getElementById('file') as HTMLInputElement;
const shadowImageDOM = document.getElementById('shadow-image')!;

const precisionDOM = document.getElementById('precision') as HTMLInputElement;
const shadowGapDOM = document.getElementById('shadow-gap') as HTMLInputElement;
const shadowRadiusDOM = document.getElementById('shadow-radius') as HTMLInputElement;
const dropTransparentDOM = document.getElementById('drop-transparent') as HTMLInputElement;
const dropWhiteDOM = document.getElementById('drop-white') as HTMLInputElement;
const dropAlphaDOM = document.getElementById('drop-alpha') as HTMLInputElement;
const randomShadowDOM = document.getElementById('random-shadow') as HTMLInputElement;
const textShadowDOM = document.getElementById('text-shadow') as HTMLInputElement;
const shadowTextDOM = document.getElementById('shadow-text') as HTMLInputElement;
const shadowTextSizeDOM = document.getElementById('shadow-text-size') as HTMLInputElement;
const exportButtonDOM = document.getElementById('export') as HTMLButtonElement;
const textShadowStyleDOM = document.getElementById('text-shadow-style') as HTMLStyleElement;

const ctx = canvas.getContext('2d')!;
const offscreenCtx = offscreenCanvas.getContext('2d')!;

let file: File;
// const width = 640;
let canvasWidth = 640;
// 精度
let precision: number = 50;
let shadowGap: number = 0;
let shadowRadius: number = 0;
let dropTransparent: boolean = true;
let dropAlpha: boolean = false;
let dropWhite: boolean = false;
let randomShadow: boolean = false;
let textShadow: boolean = false;
let shadowText = '@';
let shadowTextSize = 1;
let shadowStyle: Record<string, string> = {};
precisionDOM.value = precision + '';
shadowGapDOM.value = shadowGap + '';
shadowRadiusDOM.value = shadowRadius + '';
dropTransparentDOM.checked = dropTransparent;
dropWhiteDOM.checked = dropWhite;
dropAlphaDOM.checked = dropAlpha;
randomShadowDOM.checked = randomShadow;
textShadowDOM.checked = textShadow;
shadowTextDOM.value = shadowText;
shadowTextSizeDOM.value = shadowTextSize + '';

document.getElementById('initial')?.addEventListener('click', () => {
    fileDOM.click();
});
document.querySelector('.card-image')?.addEventListener('click', () => {
    fileDOM.click();
});
document.querySelector('#import')?.addEventListener('click', () => {
    fileDOM.click();
});

const observer = new ResizeObserver(e => {
    doPixel();
});
observer.observe(imageDOM);

fileDOM.addEventListener('change', e => {
    const files = (e.target as HTMLInputElement).files;
    if (!files?.length) return;
    file = files[0];
    document.getElementById('initial')!.style.display = 'none';
    document.getElementById('app')!.style.display = 'flex';
    doPixel();
});

precisionDOM.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    precision = +target.value;
    doPixel();
});
shadowGapDOM.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    shadowGap = +target.value;
    updateShadowImage();
});
shadowRadiusDOM.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    shadowRadius = +target.value;
    updateShadowImage();
});
dropTransparentDOM.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    dropTransparent = target.checked;
    updateShadowImage();
});
dropWhiteDOM.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    dropWhite = target.checked;
    updateShadowImage();
});
dropAlphaDOM.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    dropAlpha = target.checked;
    updateShadowImage();
});
randomShadowDOM.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    randomShadow = target.checked;
    updateShadowImage();
});
textShadowDOM.addEventListener('change', e => {
    const target = e.target as HTMLInputElement;
    textShadow = target.checked;
    updateShadowImage();
});
shadowTextDOM.addEventListener('input', e => {
    const target = e.target as HTMLInputElement;
    shadowText = target.value.trim()[0] || shadowText;
    updateShadowText();
});
shadowTextSizeDOM.addEventListener('input', e => {
    const target = e.target as HTMLInputElement;
    shadowTextSize = +target.value;
    updateShadowImage();
});

const controllerFactory = <T = any>(): [Promise<T>, (result: T) => void, (error: any) => void] => {
    let success: (result: T) => void, error: (error: any) => void;
    const controller = new Promise<T>((resolve, reject) => {
        success = resolve;
        error = reject;
    });
    return [controller, success!, error!];
};

const readFile = (file: File): Promise<string> => {
    const [controller, success, error] = controllerFactory();
    const reader = new FileReader();

    reader.addEventListener('loadend', e => {
        if (e.target?.result) {
            success(e.target.result);
        } else {
            error(new Error('Read file fail'));
        }
    });
    reader.addEventListener('error', e => {
        error(e);
    });
    reader.readAsDataURL(file);
    return controller;
};

const loadImage = (url: string, imageDOM?: HTMLImageElement): Promise<HTMLImageElement> => {
    const [controller, success, error] = controllerFactory<HTMLImageElement>();
    const img = imageDOM ?? new Image();
    img.src = url;
    img.onload = () => {
        success(img);
    };
    img.onerror = e => {
        error(e);
    };
    return controller;
};

const updateShadowText = () => {
    textShadowStyleDOM.innerText = `
.text-shadow::before {
    content: '${shadowText}';
}
`;
};

updateShadowText();

const doPixel = async () => {
    const imgUrl = await readFile(file);
    await loadImage(imgUrl, imageDOM);
    const ratio = imageDOM.naturalHeight / imageDOM.naturalWidth;
    offscreenCanvas.width = precision;
    offscreenCanvas.height = Math.round(precision * ratio);
    canvas.width = canvasWidth = Math.min(640, imageDOM.naturalWidth, imageDOM.clientWidth);
    canvas.height = canvasWidth * ratio;
    offscreenCtx.drawImage(imageDOM, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
    document.querySelectorAll('.size-wrap').forEach(dom => {
        const style = (dom as HTMLDivElement).style;
        style.width = canvasWidth + 'px';
        style.height = canvasWidth * ratio + 'px';
    });

    ctx.imageSmoothingEnabled =
        (ctx as any).mozImageSmoothingEnabled =
        (ctx as any).webkitImageSmoothingEnabled =
        (ctx as any).msImageSmoothingEnabled =
            false;
    ctx.drawImage(offscreenCanvas, 0, 0, canvasWidth, canvasWidth * ratio);
    updateShadowImage();
};

const updateShadowImage = () => {
    const ratio = imageDOM.naturalHeight / imageDOM.naturalWidth;
    const size = (canvasWidth / precision) | 0;
    const blockSize = Math.max(size - shadowGap, 1) + 'px';
    const shadow = outputShadow(size) ?? 'none';
    const height = size * precision * ratio + 'px';
    const width = size * precision + 'px';
    const borderRadius = shadowRadius + '%';
    shadowImageDOM.parentElement!.style.height = height;
    shadowImageDOM.parentElement!.style.width = width;
    shadowImageDOM.style.width = shadowImageDOM.style.height = blockSize;
    shadowImageDOM.style.fontSize = Math.max(size - shadowGap, 1) * (1 + (shadowTextSize - 1) / 5) + 'px';

    if (textShadow) {
        shadowImageDOM.style.textShadow = shadow;
        shadowImageDOM.style.boxShadow = 'none';
        shadowImageDOM.classList.add('text-shadow');
    } else {
        shadowImageDOM.style.textShadow = 'none';
        shadowImageDOM.style.boxShadow = shadow;
        shadowImageDOM.classList.remove('text-shadow');
    }
    shadowImageDOM.style.borderRadius = borderRadius;
    shadowStyle = {
        blockSize,
        borderRadius,
        shadow: shadow,
        width,
        height
    };
};

function rgbToHex(r: number, g: number, b: number) {
    if (r > 255 || g > 255 || b > 255) throw 'Invalid color component';
    return ((r << 16) | (g << 8) | b).toString(16);
}

const outputShadow = (size: number) => {
    const shadowArr = [];
    const ratio = imageDOM.naturalHeight / imageDOM.naturalWidth;
    for (let y = 0; y < precision * ratio; y++) {
        for (let x = 0; x < precision; x++) {
            const p = offscreenCtx.getImageData(x, y, 1, 1).data;
            if (dropTransparent && p[3] === 0) {
                continue;
            }
            if (dropWhite && p[3] !== 0 && p[0] === 255 && p[1] === 255 && p[2] === 255) {
                continue;
            }
            const colorInfo = [...p];
            colorInfo.length = 4;
            const color = dropAlpha
                ? '#' + ('000000' + rgbToHex(p[0], p[1], p[2])).slice(-6)
                : `rgba(${colorInfo.map((v, i) => (i === 3 ? +(v / 255).toFixed(3) : v)).join(',')})`;
            shadowArr.push(
                `${color} ${x * size}px ${y * size}px` +
                    (y === 0 && x === 0 ? (` 0 ${size}px` + textShadow ? '' : ` inset`) : '')
            );
        }
    }
    return randomShadow ? shuffle(shadowArr).join(',') : shadowArr.join(',');
};

exportButtonDOM.addEventListener('click', () => {
    copy(`
.wrap {
    width: ${shadowStyle.width};
    height: ${shadowStyle.height};
}
.pixel {
    width: ${shadowStyle.blockSize};
    height: ${shadowStyle.blockSize};
    border-radius: ${shadowStyle.borderRadius};
    box-shadow: ${shadowStyle.shadow};
}
`);
    alert('已复制到剪切板');
});
