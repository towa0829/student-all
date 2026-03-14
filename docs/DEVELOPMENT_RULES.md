# DEVELOPMENT_RULES.md

# Development Rules

このプロジェクトの開発ルール．

---

# 1 Gitルール

ブランチ戦略

```
main
develop
feature/*
```

例

```
feature/assignment-crud
feature/calendar-ui
feature/shift-system
```

---

# 2 Commitルール

```
feat: 新機能
fix: バグ修正
refactor: リファクタ
style: フォーマット
docs: ドキュメント
```

例

```
feat: add assignment create feature
fix: assignment due date bug
```

---

# 3 コンポーネント設計

コンポーネントは小さく分割する．

例

```
AssignmentCard
ShiftCard
CalendarCell
TaskItem
```

---

# 4 状態管理

最初はシンプルにする．

使用

```
useState
useEffect
```

必要になったら

```
Zustand
React Query
```

---

# 5 UIルール

UIは

```
TailwindCSS
```

を使用する．

---

# 6 コード規約

* TypeScriptを使用
* anyを極力使わない
* コンポーネントはPascalCase

例

```
AssignmentCard.tsx
```

---

# 7 開発優先順位

順序

```
1 認証
2 課題CRUD
3 カレンダー
4 バイト管理
5 ダッシュボード
```

---

# 8 完成後の改善

* UI改善
* パフォーマンス最適化
* PWA化
