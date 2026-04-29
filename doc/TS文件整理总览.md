# TS 文件整理总览

更新时间：2026-04-29

## 1. 总体统计

- TS 文件总数：34
- 主要分布目录：
  - `src/brige`：13
  - `src/Jigsawcard`：7
  - `src/unity/unity/ts`：7
  - 其他目录：7

## 2. 按目录整理

### 2.1 根目录脚本（src）

| 文件 | 归类 | 说明 |
|---|---|---|
| `src/index.ts` | 入口 | 项目 TS 入口脚本 |
| `src/dump_il2cpp.ts` | dump | IL2CPP 相关导出/解析脚本 |

### 2.2 brige 模块（src/brige）

| 文件 | 归类 | 说明 |
|---|---|---|
| `src/brige/AllAssembly.ts` | 枚举 | 枚举 Assembly 信息 |
| `src/brige/AllClass.ts` | 枚举 | 枚举 Class 信息 |
| `src/brige/AllClassAndAddr.ts` | 枚举 | 类与地址映射 |
| `src/brige/AllMethodInfo.ts` | 枚举 | 方法信息汇总 |
| `src/brige/ClassAndMethod.ts` | 查询 | 类与方法关联查询 |
| `src/brige/ClassAndMethodAddr.ts` | 查询 | 类/方法地址查询 |
| `src/brige/dump.ts` | dump | 通用 dump 脚本 |
| `src/brige/DumpFM.ts` | dump | 字段/方法导出（FM） |
| `src/brige/FilterClass.ts` | 过滤 | 类过滤逻辑 |
| `src/brige/HookClassMethod.ts` | hook | 指定类方法 Hook |
| `src/brige/PrintMethodAndPar.ts` | 打印 | 打印方法及参数 |
| `src/brige/splitDumpJson.ts` | 数据处理 | dump JSON 拆分 |
| `src/brige/TestEvn.ts` | 测试 | 环境测试脚本 |
| `src/brige/Trace.ts` | trace | 调用追踪脚本 |

### 2.3 Jigsawcard 模块（src/Jigsawcard）

| 文件 | 归类 | 说明 |
|---|---|---|
| `src/Jigsawcard/classinfo.ts` | 枚举 | 类信息导出 |
| `src/Jigsawcard/quxian.ts` | 动画/曲线 | 曲线相关脚本 |
| `src/Jigsawcard/test.ts` | 测试 | 试验脚本 |
| `src/Jigsawcard/tw.ts` | 业务实验 | 业务 Hook/调试脚本 |
| `src/Jigsawcard/twwen.ts` | 业务实验 | 业务 Hook/调试脚本 |
| `src/Jigsawcard/UnityAnimation.ts` | 动画 | Unity 动画相关 |
| `src/Jigsawcard/x.ts` | 实验 | 临时实验脚本 |

### 2.4 unity 模块（src/unity/unity/ts）

| 文件 | 归类 | 说明 |
|---|---|---|
| `src/unity/unity/ts/CalcuPar.ts` | 参数处理 | 参数计算/转换 |
| `src/unity/unity/ts/ClassInfo.ts` | 枚举 | Unity 类信息 |
| `src/unity/unity/ts/ItertorClass.ts` | 遍历 | 类迭代与遍历 |
| `src/unity/unity/ts/PointMathod.ts` | 定位 | 方法定位（命名疑似 Method） |
| `src/unity/unity/ts/PrintValue.ts` | 打印 | 值打印调试 |
| `src/unity/unity/ts/ShowMethodValue.ts` | 打印 | 方法返回值/参数展示 |
| `src/unity/unity/ts/Trace.ts` | trace | Unity 调用追踪 |

### 2.5 其他目录

| 文件 | 归类 | 说明 |
|---|---|---|
| `src/js/Tall.ts` | JS 辅助 | JS 子目录下的 TS 脚本 |
| `src/dumpIlp2dumperSo/dump_Charp.ts` | dump | CSharp 信息导出 |
| `src/dumpIlp2dumperSo/dump_class_il2cpp.ts` | dump | 类级 IL2CPP 导出 |
| `src/stalker/unity/Track.ts` | stalker | Unity 轨迹追踪 |

## 3. 可疑命名与建议

- 目录名 `brige` 可能是 `bridge` 的拼写，建议统一评估是否重命名。
- 文件名 `PointMathod.ts` 可能是 `PointMethod.ts`，建议确认并统一。
- 文件名 `ItertorClass.ts` 可能是 `IteratorClass.ts`，建议确认并统一。
- 文件名 `dump_Charp.ts` 可能是 `dump_CSharp.ts`，建议确认并统一。

## 4. 建议的后续整理规则

- 新增 TS 文件时，优先按功能落到以下目录：
  - dump/export：`src/brige` 或 `src/dumpIlp2dumperSo`
  - 业务实验：`src/Jigsawcard`
  - Unity 通用能力：`src/unity/unity/ts`
- 每个 TS 文件顶部补一行用途注释，后续可自动生成更准确文档。
- 约定命名：`动词 + 对象 + 可选范围`，例如 `HookClassMethod.ts`、`PrintMethodArgs.ts`。
