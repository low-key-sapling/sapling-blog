---
slug: unicode-base64
title: Base64 与中文之间，还差一层 UTF-8
summary: 文本先变成字节，字节再进行编码。理解边界，转换才可靠。
published: 2026-09-28
category: Web 工程
tags: [JavaScript, Unicode, 工具]
sample: true
---

这是一份编码原理示例。Base64 表达的是字节序列，不能直接把所有 Unicode 字符当成单字节值。

## 先处理字节

```ts
const bytes = new TextEncoder().encode('你好，世界 🌱');
```

编码时先使用 UTF-8，解码时还原字节，再用严格的 UTF-8 解码器转换为文本。无法组成有效文本的字节应该明确报错。

## 编码不等于加密

Base64 不保护内容的秘密。任何人都可以解码，因此它适合传输格式转换，不适合隐藏敏感信息。

可以在 [Base64 工具](/tools/base64/) 中尝试中文和 emoji。
