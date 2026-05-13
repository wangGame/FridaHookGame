# Cocos2dx 专栏

对于Cocos2dx游戏 有很明显的讨论，就是打印导出表，然后通过导出表来hook，这个和unity游戏最大的区别

## Hook方法

```ts
const soName   = "libMyGame.so";      // 替换为你的实际 so
const funcName = "_ZN7cocos2d3logEPKcz"; // 替换为你的实际函数名
const addr = Module.findExportByName(soName, funcName);
console.log("[+] cards2Str @", addr);
```

## 导出表

