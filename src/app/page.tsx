/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { usePixelConverter } from "@/hooks/use-pixel-converter";

type TabType = 'css' | 'canvas' | 'original';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('css');

  const {
    fileUrl,
    handleFileUpload,
    settings,
    setSettings,
    output,
    imageRef,
    mainCanvasRef,
    canvasWidth,
    ratio,
    processImage,
  } = usePixelConverter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Force redraw when switching to canvas tab
  useEffect(() => {
    if (activeTab === 'canvas') {
      processImage();
    }
  }, [activeTab, processImage]);

  const handleCopy = () => {
    if (!output) return;
    
    const shadowType = settings.textShadow ? "text-shadow" : "box-shadow";
    let css = `.pixel-wrap {\n  width: ${output.width};\n  height: ${output.height};\n}\n.pixel {\n  width: ${output.blockSize};\n  height: ${output.blockSize};\n  border-radius: ${output.borderRadius};\n}\n`;

    if (settings.textShadow) {
      css += `.pixel::before {\n  content: '${settings.shadowText}';\n  font-size: ${output.fontSize};\n  font-family: initial;\n  color: transparent;\n}\n`;
    }

    if (settings.animeMode) {
      css += `.pixel {\n  ${shadowType}: ${output.animeShadow};\n  will-change: auto;\n  transition: box-shadow 1.2s, text-shadow 1.2s;\n}\n.pixel-wrap:hover .pixel {\n  ${shadowType}: ${output.shadow};\n}\n`;
    } else {
      css += `.pixel {\n  ${shadowType}: ${output.shadow};\n}\n`;
    }

    navigator.clipboard.writeText(css).then(() => {
      alert("复制 shadow 样式成功");
    });
  };

  return (
    <>
      <div id="main">
        {/* Global hidden file input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleFileUpload(e.target.files[0]);
            }
            // Reset value so same file can be selected again
            e.target.value = '';
          }}
        />

        {!fileUrl ? (
          // Initial upload view
          <div 
            id="initial" 
            onClick={() => fileInputRef.current?.click()}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ zIndex: 10, position: 'relative', textAlign: 'center' }}>
              点击这里选择图片开始
            </div>
            <div className="bg"></div>
          </div>
        ) : (
          <div id="app">
            <div className="card-info">
              <h2 className="title">图片像素转换器</h2>
              <div className="remark">
                <span className="symbol-wrap"><span className="symbol">✌️</span></span> 将你的图片转成像素风 <span className="symbol">✌️</span>
              </div>
              <hr />
              <div className="form">
                <div className="item">
                  <label>
                    精度
                    <input
                      type="range"
                      min="2"
                      max="100"
                      value={settings.precision}
                      onChange={(e) => setSettings({ ...settings, precision: Number(e.target.value) })}
                    />
                  </label>
                </div>
                <div className="item">
                  <label>
                    shadow 间隙
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={settings.shadowGap}
                      onChange={(e) => setSettings({ ...settings, shadowGap: Number(e.target.value) })}
                    />
                  </label>
                </div>
                <div className="item">
                  <label>
                    shadow 圆角
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={settings.shadowRadius}
                      onChange={(e) => setSettings({ ...settings, shadowRadius: Number(e.target.value) })}
                    />
                  </label>
                </div>
                <div className="item">
                  <label>
                    去除 shadow 中的透明块
                    <input
                      type="checkbox"
                      checked={settings.dropTransparent}
                      onChange={(e) => setSettings({ ...settings, dropTransparent: e.target.checked })}
                    />
                  </label>
                </div>
                <div className="item">
                  <label>
                    去除 shadow 中的白色
                    <input
                      type="checkbox"
                      checked={settings.dropWhite}
                      onChange={(e) => setSettings({ ...settings, dropWhite: e.target.checked })}
                    />
                  </label>
                </div>
                <div className="item">
                  <label>
                    去除 shadow 中的 alpha 通道
                    <input
                      type="checkbox"
                      checked={settings.dropAlpha}
                      onChange={(e) => setSettings({ ...settings, dropAlpha: e.target.checked })}
                    />
                  </label>
                </div>
                <div className="item">
                  <label>
                    使用 text-shadow
                    <input
                      type="checkbox"
                      checked={settings.textShadow}
                      onChange={(e) => setSettings({ ...settings, textShadow: e.target.checked })}
                    />
                  </label>
                </div>
                {settings.textShadow && (
                  <>
                    <div className="item">
                      <label>
                        自定义 text-shadow 文字
                        <input
                          type="text"
                          maxLength={1}
                          value={settings.shadowText}
                          className='shadow-text-input'
                          onChange={(e) =>
                            setSettings({ ...settings, shadowText: e.target.value.trim().charAt(0) || "@" })
                          }
                        />
                      </label>
                    </div>
                    <div className="item">
                      <label>
                        text-shadow 文字比例
                        <input
                          type="range"
                          min="1"
                          max="31"
                          value={settings.shadowTextSize}
                          onChange={(e) => setSettings({ ...settings, shadowTextSize: Number(e.target.value) })}
                        />
                      </label>
                    </div>
                  </>
                )}
                <div className="item">
                  <label>
                    开启动画模式
                    <input
                      type="checkbox"
                      checked={settings.animeMode}
                      onChange={(e) => setSettings({ ...settings, animeMode: e.target.checked })}
                    />
                  </label>
                </div>
              </div>
              <div className="btn-group" style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  style={{ flex: 1, whiteSpace: 'nowrap' }} 
                  onClick={() => fileInputRef.current?.click()}
                >
                  更换图片
                </button>
                <button 
                  type="button" 
                  style={{ flex: 1, whiteSpace: 'nowrap' }} 
                  onClick={handleCopy}
                >
                  复制 shadow 样式
                </button>
              </div>
            </div>

            <div className="preview-area">
              <div className="preview-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'css' ? 'active' : ''}`}
                  onClick={() => setActiveTab('css')}
                >
                  CSS 像素
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'canvas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('canvas')}
                >
                  Canvas 像素
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'original' ? 'active' : ''}`}
                  onClick={() => setActiveTab('original')}
                >
                  原图
                </button>
              </div>

              <div className="preview-content">
                <div className="card-shadow" style={{ display: activeTab === 'css' ? 'flex' : 'none' }}>
                  <div className="size-wrap">
                    {output && (
                      <div className="pixel-wrap" style={{ width: output.width, height: output.height }}>
                        <div
                          className="pixel"
                          style={{
                            width: output.blockSize,
                            height: output.blockSize,
                            borderRadius: output.borderRadius,
                            boxShadow: settings.textShadow ? undefined : (settings.animeMode ? output.animeShadow : output.shadow),
                            textShadow: settings.textShadow ? (settings.animeMode ? output.animeShadow : output.shadow) : undefined,
                            transition: settings.animeMode ? "box-shadow 1.2s, text-shadow 1.2s" : "none",
                            willChange: settings.animeMode ? "auto" : "none",
                          }}
                        ></div>
                        {/* Injection styles */}
                        {settings.textShadow && (
                          <style>{`
                            .pixel::before {
                              content: '${settings.shadowText}';
                              font-size: ${output.fontSize};
                              font-family: initial;
                              color: transparent;
                            }
                          `}</style>
                        )}
                        {settings.animeMode && (
                          <style>{`
                            .pixel-wrap:hover .pixel {
                              box-shadow: ${!settings.textShadow ? output.shadow : "none"} !important;
                              text-shadow: ${settings.textShadow ? output.shadow : "none"} !important;
                            }
                          `}</style>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-canvas" style={{ display: activeTab === 'canvas' ? 'flex' : 'none' }}>
                  <div className="size-wrap">
                    <div
                        style={{
                          width: canvasWidth,
                          height: canvasWidth * ratio,
                          position: 'relative',
                          maxWidth: '100%',
                        }}
                    >
                      <canvas 
                        ref={mainCanvasRef}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            imageRendering: 'pixelated'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="card-image" style={{ display: activeTab === 'original' ? 'flex' : 'none' }}>
                  <div className="size-wrap image-wrap">
                    <div 
                      style={{ cursor: 'pointer' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <img src={fileUrl} alt="original" style={{ maxWidth: '100%', display: 'block' }} />
                      <div className="tip">点击更换图片</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Ensure hidden items needed for calculations always remain in DOM */}
              <img
                ref={imageRef}
                src={fileUrl}
                alt="original"
                crossOrigin="anonymous"
                onLoad={processImage}
                hidden
              />
              <canvas id="offscreen" hidden></canvas>
            </div>
          </div>
        )}
      </div>

      <footer id="footer">
        <p className="copyright">
          © 2022-present <a href="https://github.com/ZxBing0066">ZxBing0066</a>. All Rights Reserved.
        </p>
        <a href="https://github.com/ZxBing0066/pixel-converter" className="github">
          <img src="/GitHub.png" alt="GitHub" />
        </a>
      </footer>
    </>
  );
}
