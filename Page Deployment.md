### 主分支构建dist
```bash
npm run build
```

### 提交更改

```bash
# 添加更改
git add .

# 提交更改
git commit -m "update page"
```

### 推送分支到远程仓库

推送分支到GitHub：

```bash
git push origin gh-pages
```


- 如果部署失败，检查GitHub仓库的Pages设置
- 确保所有依赖已安装：`npm install`
- 验证构建输出：`npm run build`