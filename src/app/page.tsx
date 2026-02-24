/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { usePixelConverter, downloadFile } from "@/hooks/use-pixel-converter";

type TabType = 'css' | 'canvas' | 'original';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('css');
  const [isCopied, setIsCopied] = useState(false);

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
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleDownloadImage = async () => {
    if ((activeTab === 'canvas' || activeTab === 'css') && mainCanvasRef.current) {
      // Both CSS and Canvas pixel views are visually identical on the canvas
      // Exporting from canvas ensures it works flawlessly without generating huge box-shadow strings that fail html2canvas
      const dataUrl = mainCanvasRef.current.toDataURL("image/png");
      downloadFile(dataUrl, "pixel_art.png");
    }
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
            <div className="card-info glass-panel">
              <div className="card-header">
                <h2 className="title">Pixel Converter</h2>
                <div className="remark">
                  <span className="symbol-wrap"><span className="symbol" role="img" aria-label="peace">✌️</span></span> 将你的图片转成像素风 <span className="symbol" role="img" aria-label="peace">✌️</span>
                </div>
              </div>
              
              <div className="form-container scrollable-area">
                <div className="form-section">
                  <h3 className="section-title">基础调整</h3>
                  
                  <div className="control-group">
                    <div className="control-header">
                      <label htmlFor="precision">精度</label>
                      <span className="control-value">{settings.precision}</span>
                    </div>
                    <input
                      id="precision"
                      type="range"
                      min="2"
                      max="100"
                      className="modern-range"
                      value={settings.precision}
                      onChange={(e) => setSettings({ ...settings, precision: Number(e.target.value) })}
                    />
                  </div>

                  <div className="control-group">
                    <div className="control-header">
                      <label htmlFor="shadowGap">阴影间隙</label>
                      <span className="control-value">{settings.shadowGap} px</span>
                    </div>
                    <input
                      id="shadowGap"
                      type="range"
                      min="0"
                      max="10"
                      className="modern-range"
                      value={settings.shadowGap}
                      onChange={(e) => setSettings({ ...settings, shadowGap: Number(e.target.value) })}
                    />
                  </div>

                  <div className="control-group">
                    <div className="control-header">
                      <label htmlFor="shadowRadius">阴影圆角</label>
                      <span className="control-value">{settings.shadowRadius}%</span>
                    </div>
                    <input
                      id="shadowRadius"
                      type="range"
                      min="0"
                      max="50"
                      className="modern-range"
                      value={settings.shadowRadius}
                      onChange={(e) => setSettings({ ...settings, shadowRadius: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">色彩过滤</h3>
                  
                  <div className="control-group switch-group">
                    <label htmlFor="dropTransparent">去除透明块</label>
                    <label className="switch">
                      <input
                        id="dropTransparent"
                        type="checkbox"
                        checked={settings.dropTransparent}
                        onChange={(e) => setSettings({ ...settings, dropTransparent: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="control-group switch-group">
                    <label htmlFor="dropWhite">去除纯白色</label>
                    <label className="switch">
                      <input
                        id="dropWhite"
                        type="checkbox"
                        checked={settings.dropWhite}
                        onChange={(e) => setSettings({ ...settings, dropWhite: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="control-group switch-group">
                    <label htmlFor="dropAlpha">去除半透明通道</label>
                    <label className="switch">
                      <input
                        id="dropAlpha"
                        type="checkbox"
                        checked={settings.dropAlpha}
                        onChange={(e) => setSettings({ ...settings, dropAlpha: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">高级特效</h3>
                  
                  <div className="control-group switch-group">
                    <label htmlFor="textShadow">使用 Text-Shadow 渲染</label>
                    <label className="switch">
                      <input
                        id="textShadow"
                        type="checkbox"
                        checked={settings.textShadow}
                        onChange={(e) => setSettings({ ...settings, textShadow: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  {settings.textShadow && (
                    <div className="sub-settings">
                      <div className="control-group input-group">
                        <label htmlFor="shadowText">自定义填充文字</label>
                        <input
                          id="shadowText"
                          type="text"
                          maxLength={1}
                          value={settings.shadowText}
                          className="modern-input"
                          onChange={(e) =>
                            setSettings({ ...settings, shadowText: e.target.value.trim().charAt(0) || "@" })
                          }
                        />
                      </div>
                      
                      <div className="control-group">
                        <div className="control-header">
                          <label htmlFor="shadowTextSize">文字比例</label>
                          <span className="control-value">{settings.shadowTextSize}</span>
                        </div>
                        <input
                          id="shadowTextSize"
                          type="range"
                          min="1"
                          max="31"
                          className="modern-range"
                          value={settings.shadowTextSize}
                          onChange={(e) => setSettings({ ...settings, shadowTextSize: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  )}

                  <div className="control-group switch-group">
                    <label htmlFor="animeMode">开启动画模式</label>
                    <label className="switch">
                      <input
                        id="animeMode"
                        type="checkbox"
                        checked={settings.animeMode}
                        onChange={(e) => setSettings({ ...settings, animeMode: e.target.checked })}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="action-footer">
                <button 
                  type="button" 
                  className="btn-secondary transition-transform active:scale-95"
                  onClick={() => fileInputRef.current?.click()}
                >
                  更换图片
                </button>
                <button 
                  type="button" 
                  className="btn-primary transition-transform active:scale-95"
                  onClick={handleCopy}
                >
                  {isCopied ? "已复制！" : "复制 CSS 代码"}
                </button>
              </div>
            </div>

            <div className="preview-area glass-panel">
              <div className="preview-tabs">
                {(['css', 'canvas', 'original'] as const).map((tab) => (
                  <button 
                    key={tab}
                    className={`modern-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'css' && 'CSS 像素'}
                    {tab === 'canvas' && 'Canvas 渲染'}
                    {tab === 'original' && '原始对照'}
                    {activeTab === tab && <div className="tab-indicator layout-id-tab" />}
                  </button>
                ))}
              </div>

              <div className="preview-content-wrapper">
                <div className="preview-container view-anim" style={{ display: activeTab === 'css' ? 'flex' : 'none' }}>
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

                <div className="preview-container view-anim" style={{ display: activeTab === 'canvas' ? 'flex' : 'none' }}>
                  <div className="size-wrap">
                    <div
                        style={{
                          width: output ? output.width : canvasWidth,
                          height: output ? output.height : canvasWidth * ratio,
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

                <div className="preview-container view-anim" style={{ display: activeTab === 'original' ? 'flex' : 'none' }}>
                  <div className="size-wrap image-wrap">
                    <button 
                      className="image-button-wrapper"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="更原始图片"
                    >
                      <img src={fileUrl} alt="original" style={{ width: '100%', height: 'auto', display: 'block' }} />
                      <div className="tip">
                        <span>换一张图片</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {(activeTab === 'css' || activeTab === 'canvas') && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1em 0 1.5em' }}>
                  <button 
                    type="button" 
                    className="btn-primary transition-transform active:scale-95"
                    style={{ minWidth: '200px', background: 'linear-gradient(135deg, #646cff, #8a4fc5)' }}
                    onClick={handleDownloadImage}
                  >
                    🚀 保存 {activeTab === 'css' ? 'CSS ' : 'Canvas '}像素图
                  </button>
                </div>
              )}

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
