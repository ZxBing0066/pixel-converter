import type { Metadata } from "next";
import "./style.css";
import "./bg.css";

export const metadata: Metadata = {
  title: "像素图片转换器 | 图片转像素 | 像素图生成器 | 纯 CSS 像素图 | 马赛克图片 | 像素图动画",
  description: "上传图片即可一键将图片转换为像素风格，支持多种自定义方式，可生成方块像素、点状像素和文字像素图等等。支持导出纯 CSS 像素图，并支持生成 CSS 像素图动画。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
