# Web GIS 资产条件评估平台

一个基于 Web GIS 的资产管理和条件评估平台，支持在地图上创建、查看和管理资产，并进行条件评估。

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [API 文档](#api-文档)
- [数据库结构](#数据库结构)
- [使用指南](#使用指南)
- [故障排除](#故障排除)

## ✨ 功能特性

- 🗺️ **交互式地图**：基于 Leaflet 的地图界面，支持资产位置可视化
- 📍 **资产管理**：创建、查看、删除资产点
- 📊 **条件评估**：对资产进行条件评估和报告
- 📱 **响应式设计**：支持桌面端和移动端，根据屏幕大小自动调整功能
- 📍 **GPS 定位**：移动端支持 GPS 位置跟踪和最近资产查找
- 🎨 **可视化标记**：根据资产条件状态使用不同颜色的标记
- 📈 **数据可视化**：提供图表和统计功能
- 🔐 **用户管理**：支持多用户系统

## 🛠️ 技术栈

### 前端
- **Leaflet.js** - 地图库
- **Bootstrap** - UI 框架
- **jQuery** - DOM 操作和 AJAX
- **Express** - 静态文件服务器

### 后端
- **Node.js** - 运行时环境
- **Express.js** - Web 框架
- **PostgreSQL** - 关系型数据库
- **PostGIS** - 地理空间数据库扩展

### 工具
- **Docker** - 容器化部署
- **Docker Compose** - 多容器编排
- **pgAdmin** - 数据库管理工具

## 📁 项目结构

```
local-demo/
├── backend/                 # 后端代码
│   ├── routes/             # API 路由
│   │   ├── crud.js        # CRUD 操作
│   │   └── geoJSON.js     # GeoJSON 数据接口
│   ├── dataAPI.js         # API 服务器（备用）
│   └── package.json       # 后端依赖
│
├── frontend/               # 前端代码
│   ├── js/                # JavaScript 文件
│   │   ├── basicMapLeaflet.js    # 地图主逻辑
│   │   ├── assetCreation.js       # 资产创建
│   │   ├── trackLocation.js       # GPS 定位
│   │   ├── uploadData.js          # 数据上传
│   │   └── ...
│   ├── css/               # 样式文件
│   ├── bootStrap.html     # 主页面
│   ├── dashboard.html     # 仪表板
│   └── app.js            # Express 服务器
│
├── db/                    # 数据库脚本
│   ├── schema.sql        # 数据库结构
│   ├── seed_data.sql    # 初始数据
│   └── views.sql         # 数据库视图
│
└── docker-compose.yml     # Docker 配置
```

## 🚀 快速开始

### 前置要求

- Node.js (v14 或更高版本)
- Docker 和 Docker Compose
- 现代浏览器（支持 Geolocation API）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd web-gis-rating-platform/local-demo
   ```

2. **启动数据库服务**
   ```bash
   docker-compose up -d
   ```
   这将启动：
   - PostgreSQL + PostGIS 数据库（端口 5432）
   - pgAdmin 管理界面（端口 5050）

3. **安装前端依赖**
   ```bash
   cd frontend
   npm install
   ```

4. **启动前端服务器**
   ```bash
   node app.js
   ```
   服务器将在 `http://localhost:3000` 启动

5. **访问应用**
   - 主应用：`http://localhost:3000/bootStrap.html`
   - 仪表板：`http://localhost:3000/dashboard.html`
   - pgAdmin：`http://localhost:5050`

## ⚙️ 配置说明

### 数据库配置

数据库配置在 `docker-compose.yml` 中：

```yaml
POSTGRES_USER: user101
POSTGRES_PASSWORD: mypassword
POSTGRES_DB: ucfscde
```

### API 配置

前端 API 地址在 `frontend/js/basicMapLeaflet.js` 中配置：

```javascript
const serverURL = "http://localhost:3000"
```

### 数据库连接

后端数据库连接在 `backend/routes/crud.js` 和 `backend/routes/geoJSON.js` 中：

```javascript
const pool = new pg.Pool({
    user: "user101",
    host: "localhost",
    database: "ucfscde",
    password: "mypassword",
    port: 5432
});
```

## 📡 API 文档

### CRUD 端点

#### 获取用户 ID
```
GET /api/userId
```
返回当前用户的 ID

#### 获取条件选项
```
GET /api/conditionDetails
```
返回所有可用的资产条件选项

#### 创建资产
```
POST /api/insertAssetPoint
Body: {
  asset_name: string,
  installation_date: date,
  longitude: number,
  latitude: number
}
```

#### 删除资产
```
POST /api/deleteAsset
Body: {
  id: number
}
```

#### 创建条件报告
```
POST /api/insertConditionInformation
Body: {
  asset_name: string,
  condition_description: string
}
```

### GeoJSON 端点

#### 获取用户资产
```
GET /api/geojson/userAssets/:user_id
```
返回指定用户的所有资产（GeoJSON 格式）

#### 获取最近 5 个条件报告
```
GET /api/geojson/lastFiveConditionReports/:user_id
```

#### 获取用户附近 5 个资产
```
GET /api/geojson/userFiveClosestAssets/:latitude/:longitude
```

## 🗄️ 数据库结构

### 主要表

- **ucfscde.users** - 用户表
- **cege0043.asset_information** - 资产信息表
- **cege0043.asset_condition_options** - 条件选项表
- **cege0043.asset_condition_information** - 条件报告表

### 视图

- **asset_with_latest_condition** - 资产及其最新条件
- **condition_reports_with_text_descriptions** - 条件报告详情
- **report_summary** - 报告统计摘要

详细结构请查看 `db/schema.sql` 和 `db/views.sql`

## 📖 使用指南

### 桌面端（大屏幕）

1. **创建资产**
   - 点击地图上的任意位置
   - 填写资产名称和安装日期
   - 点击保存

2. **查看资产信息**
   - 点击地图上的资产标记
   - 查看资产详情和最新条件

3. **条件评估**
   - 点击资产标记
   - 选择条件状态
   - 保存评估

### 移动端（小屏幕）

1. **GPS 定位**
   - 系统自动获取当前位置
   - 自动查找附近 5 个资产
   - 自动弹出最近资产的条件评估表单

2. **条件评估**
   - 系统自动显示最近资产
   - 填写条件评估
   - 保存报告

### 标记颜色说明

- 🟢 **绿色** - 状态良好
- 🔵 **蓝色** - 轻微缺陷
- 🟠 **橙色** - 需要维护
- 🔴 **红色** - 需要尽快维护
- 🟣 **紫色** - 紧急维护
- ⚪ **灰色** - 未知状态

## 🔧 故障排除

### 数据库连接失败

1. 检查 Docker 容器是否运行：
   ```bash
   docker ps
   ```

2. 检查数据库日志：
   ```bash
   docker-compose logs db
   ```

3. 确认数据库配置是否正确

### API 请求失败

1. 检查服务器是否运行：
   ```bash
   lsof -ti:3000
   ```

2. 查看服务器日志

3. 检查浏览器控制台的错误信息

### GPS 定位不工作

1. 确保浏览器允许位置访问权限
2. 使用 HTTPS 或 localhost（某些浏览器要求）
3. 检查设备是否支持 GPS

### pgAdmin 连接数据库

在 pgAdmin 中添加服务器时：
- **Host**: `db`（在 Docker 网络内）或 `localhost`（从宿主机）
- **Port**: `5432`
- **Username**: `user101`
- **Password**: `mypassword`
- **Database**: `ucfscde`

## 📝 开发说明

### 更新数据库视图

如果修改了 `db/views.sql`，需要手动更新数据库：

```bash
docker exec -i cege0043_postgis psql -U user101 -d ucfscde < db/views.sql
```

### 重置数据库

如果需要重置数据库：

```bash
docker-compose down -v
docker-compose up -d
```

这将删除所有数据并重新初始化。

<!-- ## 📄 许可证

[添加你的许可证信息]

## 👥 贡献 -->

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

[添加你的联系方式]

