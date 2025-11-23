# 📊 Visit Counter API

Self-hosted visit counter system with Docker, PostgreSQL, and authentication-based site registration.

## ✨ Features

-   🎨 **Customizable SVG Badges** (4 styles, custom colors)
-   🔐 **Authentication System** (secure site registration via API)
-   🍪 **Cookie-based Visitor Tracking** (unique visitor detection)
-   📈 **Detailed Analytics** (devices, browsers, geolocation)
-   🐳 **Docker Ready** (easy deployment with docker-compose)
-   🚀 **Complete REST API** (easy integration)
-   🌍 **CORS Enabled** - Use from any domain without configuration!
-   🆔 **UUID-based Site IDs** - Each site has its own independent counter
-   📊 **Real-time Stats** (total visits, unique visitors)

## 🏗️ Tech Stack

-   **Backend**: Node.js 18 + Express 4.18
-   **Database**: PostgreSQL 15
-   **ORM**: Sequelize
-   **Container**: Docker + Docker Compose
-   **Analytics**: GeoIP-Lite + UserAgent
-   **Authentication**: Environment-based credentials

## 📦 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/icastelito/contador-de-visitas.git
cd contador-de-visitas
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

**Edit `.env` with your settings:**

```env
# Server
PORT=3000
NODE_ENV=production

# PostgreSQL
DB_HOST=postgres
DB_PORT=5432
DB_NAME=contador_visitas
DB_USER=postgres
DB_PASSWORD=your_secure_password_here  # ⚠️ CHANGE THIS!

# Application
COOKIE_SECRET=your_secret_key_here  # ⚠️ CHANGE THIS!

# Admin (for registering new sites)
ADMIN_USER=your_username  # ⚠️ CHANGE THIS!
ADMIN_PASSWORD=your_strong_password  # ⚠️ CHANGE THIS!

# Base URL (used to generate scripts)
BASE_URL=http://localhost:3000

# Default badge customization
DEFAULT_BADGE_STYLE=flat
DEFAULT_BADGE_COLOR=4c1
DEFAULT_LABEL=Visits
```

**🔒 Generate secure passwords:**

```bash
# Database password
openssl rand -base64 32

# Cookie secret
openssl rand -base64 48
```

### 3. Run with Docker (Recommended)

```bash
# Start containers
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

Server will be available at `http://localhost:3000`

### 4. Local Development (Optional)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

**⚠️ Note about CORS:** The system accepts requests from any origin. Access control is done by `siteId`, not by domain.

## 🚀 Usage Guide

### Step 1: Register a New Site

**Before using the counter, you need to register your site via API:**

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "user": "your_admin_user",
    "password": "your_admin_password",
    "customizable": true
  }'
```

**Response:**

```json
{
	"success": true,
	"siteId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
	"customizable": true,
	"script": "<!-- ready-to-use code -->",
	"scriptFormatted": "<!-- formatted code with line breaks -->",
	"endpoints": {
		"badge": "http://localhost:3000/api/badge/f47ac10b...",
		"count": "http://localhost:3000/api/count/f47ac10b...",
		"increment": "http://localhost:3000/api/count/f47ac10b.../increment",
		"stats": "http://localhost:3000/api/stats/f47ac10b..."
	}
}
```

**💡 Save the returned `siteId`!** You'll need it for all requests.

**Parameters:**

-   `customizable: true` → Returns example code to create your own custom tag
-   `customizable: false` → Returns complete widget (badge + GDPR)

---

### Option 1: 100% Custom Tag (customizable: true)

**Create your own design and just use our API to fetch the number!**

```html
<!-- Your custom design -->
<div
	style="padding: 15px 25px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
     color: white; border-radius: 8px; font-weight: 600; display: inline-flex; align-items: center;"
>
	👁️ <span id="visit-counter">0</span> visits
</div>

<!-- Simple JavaScript -->
<script>
	// Use the siteId you received from registration!
	fetch("https://your-server.com/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment?format=text", {
		credentials: "include",
	})
		.then((r) => r.text())
		.then((count) => (document.getElementById("visit-counter").textContent = count))
		.catch((err) => console.error("Error loading counter:", err));
</script>
```

**Available formats:**

-   `?format=json` - Complete JSON `{ totalVisits: 1234, uniqueVisits: 567 }`
-   `?format=text` - Just the number `1234`
-   `?format=formatted` - Formatted `1.2K` or `1.5M`

**Endpoints:**

-   `GET /api/count/:siteId` - Read-only (doesn't increment)
-   `GET /api/count/:siteId/increment` - Increments AND returns the value

### Option 2: SVG Badge

```html
<img src="https://your-server.com/api/badge/your-site-id" alt="Visits" />
```

**Customize badge via URL:**

```html
<img
	src="https://your-server.com/api/badge/your-site-id?style=flat-square&color=blue&label=Visitors&logo=👁️"
	alt="Visits"
/>
```

### Option 3: Manual Tracking (JavaScript)

```javascript
// Track visit
fetch("https://your-server.com/api/track/your-site-id", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	credentials: "include",
	body: JSON.stringify({
		page: window.location.href,
		referrer: document.referrer,
	}),
});

// Get statistics
const stats = await fetch("https://your-server.com/api/stats/your-site-id?days=30").then((r) => r.json());
console.log(stats);
```

## 🎨 Customization

### Badge Styles

-   `flat` - Default flat style
-   `flat-square` - Square without rounded borders
-   `plastic` - 3D plastic effect
-   `for-the-badge` - GitHub Actions style

### Available Colors

-   `brightgreen`, `green`, `yellowgreen`, `yellow`
-   `orange`, `red`, `blue`, `lightgrey`
-   Or use hex code: `007acc`, `4c1`, etc.

### Configure Default Badge

```bash
curl -X PUT https://your-server.com/api/config/your-site-id \
  -H "Content-Type: application/json" \
  -d '{
    "badgeStyle": "flat-square",
    "badgeColor": "blue",
    "badgeLabel": "Visitors",
    "badgeLogo": "👁️"
  }'
```

## 📡 API Endpoints

### `POST /api/register`

Register a new site and get a unique UUID.

**Authentication required:** Admin credentials from `.env`

**Request Body:**

```json
{
	"user": "your_admin_user",
	"password": "your_admin_password",
	"customizable": true
}
```

**Response:**

```json
{
  "success": true,
  "siteId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "customizable": true,
  "script": "<!-- ready-to-use code -->",
  "scriptFormatted": "<!-- formatted with line breaks -->",
  "endpoints": { ... }
}
```

### `GET /api/badge/:siteId`

Returns SVG badge with visit counter.

**Query params:**

-   `style`: flat, flat-square, plastic, for-the-badge
-   `color`: Color name or hex code
-   `label`: Custom text
-   `logo`: Emoji or unicode

### `POST /api/track/:siteId`

Registers a new visit.

**Body:**

```json
{
	"page": "https://mysite.com/page",
	"referrer": "https://google.com"
}
```

### `GET /api/count/:siteId` ⭐

Returns counter **without registering a new visit** (read-only).

**Query params:**

-   `format=json` - Returns complete JSON (default)
-   `format=text` - Returns only the number as text
-   `format=formatted` - Returns formatted number (1.2K, 1.5M)

**Response (JSON):**

```json
{
	"totalVisits": 1234,
	"uniqueVisits": 567
}
```

**Response (text):**

```
1234
```

**Response (formatted):**

```
1.2K
```

### `GET /api/count/:siteId/increment` ⭐

**Increments the counter AND returns the value** (tracking + count in one call).

Accepts the same format query params. Ideal for custom tag integration.

**Example:**

```javascript
fetch("/api/count/my-site/increment?format=text", {
	credentials: "include",
})
	.then((r) => r.text())
	.then((count) => console.log(count)); // "1235"
```

### `GET /api/stats/:siteId`

Returns detailed statistics.

**Query params:**

-   `days`: Number of days (default: 30)

**Response:**

```json
{
	"totalVisits": 1234,
	"uniqueVisits": 567,
	"period": {
		"days": 30,
		"visits": 890
	},
	"devices": {
		"desktop": 450,
		"mobile": 380,
		"tablet": 60
	},
	"browsers": {
		"Chrome 120": 500,
		"Firefox 121": 250
	},
	"countries": {
		"BR": 600,
		"US": 200
	}
}
```

### `PUT /api/config/:siteId`

Updates badge configuration.

**Body:**

```json
{
	"badgeStyle": "flat",
	"badgeColor": "blue",
	"badgeLabel": "Visits",
	"badgeLogo": "📊",
	"domain": "mysite.com"
}
```

## 🔒 Privacy & Security

### Collected Data

-   **Anonymized IP** (SHA-256 hash)
-   **User Agent** (browser/OS)
-   **Visited page**
-   **Referrer**
-   **Approximate geolocation** (country/region)
-   **Browser language**
-   **Unique visitor ID** (UUID, cookie-based with 1-year expiration)

### Cookie Management

-   **visitor_id cookie** - Tracks unique visitors (1 year expiration)
-   Same visitor = multiple total visits but only 1 unique visit
-   Cookie is set automatically on first visit
-   httpOnly and sameSite security flags enabled

### Compliance

✅ IPs are always anonymized  
✅ Minimal data collection  
✅ No cross-site tracking  
✅ Full transparency about collected data  
✅ Cookie-based visitor detection

## 🆔 How Site ID Control Works

Each site/project uses a **unique UUID** (`siteId`) to have its own independent counter:

```javascript
// Site 1
fetch("/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment"); // Counter: 1234

// Site 2
fetch("/api/count/a1b2c3d4-e5f6-7890-abcd-ef1234567890/increment"); // Counter: 567

// Site 3
fetch("/api/count/9z8y7x6w-5v4u-3t2s-1r0q-p9o8n7m6l5k4/increment"); // Counter: 890
```

**Advantages:**

-   ✅ No need to configure domains
-   ✅ Use on multiple sites without bureaucracy
-   ✅ Each site maintains its separate counter
-   ✅ Works from any origin (CORS enabled)
-   ✅ Simple control: whoever has the ID can use it
-   ✅ Secure: UUIDs are hard to guess

**To create a new site counter, register it via `/api/register` endpoint!**

## 🐳 Docker Deployment

### Docker Compose (Recommended)

```bash
# Start containers
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down

# Restart containers
docker compose restart

# Reset database (WARNING: Deletes all data!)
docker compose down -v
docker compose up -d
```

### Production Deployment

For production deployment with Nginx Proxy Manager and SSL, check out our comprehensive guides:

-   **[DEPLOY.md](./DEPLOY.md)** - Complete production deployment guide
-   **[AUTO_DEPLOY.md](./AUTO_DEPLOY.md)** - Automated deployment with GitHub webhooks
-   **[DBEAVER.md](./DBEAVER.md)** - Database connection guide with DBeaver

### Quick Production Setup

1. Edit `.env` with secure passwords
2. Configure Nginx Proxy Manager for SSL and domain routing
3. Run `docker compose up -d`
4. Register your first site via `/api/register`
5. Use the returned script in your website

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it contador-visitas-db psql -U postgres -d contador_visitas

# View registered sites
SELECT id, domain, total_visits, unique_visits FROM sites;

# Exit
\q
```

## 🛠️ Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Run Migrations

```bash
npm run migrate
```

### Project Structure

```
contador-de-visitas/
├── src/
│   ├── app.js              # Express server
│   ├── config/
│   │   └── database.js     # PostgreSQL configuration
│   ├── models/
│   │   ├── Site.js         # Site model (UUID-based)
│   │   ├── Visit.js        # Visit model
│   │   └── Visitor.js      # Visitor model
│   ├── routes/
│   │   └── counter.js      # API routes (register, count, stats, etc.)
│   ├── services/
│   │   └── badge.js        # SVG badge generator
│   ├── utils/
│   │   └── analytics.js    # Analytics utilities
│   └── migrations/
│       └── run.js          # Migration script
├── public/
│   ├── widget.js           # JavaScript widget
│   └── exemplo.html        # Example page
├── docker-compose.yml      # Docker orchestration
├── Dockerfile              # Node.js 18 Alpine image
├── package.json
├── .env.example            # Environment variables template
├── DEPLOY.md               # Production deployment guide
├── AUTO_DEPLOY.md          # Automated deployment guide
└── DBEAVER.md              # Database connection guide
```

## 📊 Database Schema

### Tables

**sites**

-   `id` (UUID, primary key) - Unique site identifier
-   `domain` (string) - Site domain (optional)
-   `total_visits` (integer) - Total visit count
-   `unique_visits` (integer) - Unique visitor count
-   `badge_style`, `badge_color`, `badge_label`, `badge_logo` - Badge customization
-   `customizable` (boolean) - Whether site can customize badge
-   `created_at`, `updated_at` - Timestamps

**visitors**

-   Unique visitor tracking
-   Cookie consent management
-   Visit statistics

**visits**

-   Individual visit records
-   Technical data and analytics
-   Geolocation data
-   Referrer and page information

## ❓ FAQ

### Do I need to configure CORS?

**No!** CORS is enabled for all origins. Just use the correct `siteId`.

### How do I add a new site?

**Register it via API!** Use the `/api/register` endpoint with admin credentials:

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"user":"admin","password":"password","customizable":true}'
```

You'll receive a unique UUID to use in your website.

### Can I use it on multiple domains?

**Yes!** Use the same `siteId` on all sites where you want to share the counter, or use different UUIDs for separate counters.

### Is it safe to leave CORS open?

**Yes!** Access control is by `siteId` (UUID), not by domain. Without knowing the exact UUID, no one can access another site's counter. UUIDs are cryptographically random and very hard to guess.

### How do I protect my counter?

UUIDs generated by the `/api/register` endpoint are already secure and hard to guess:

```javascript
// ✅ Secure UUID (generated automatically)
fetch("/api/count/f47ac10b-58cc-4372-a567-0e02b2c3d479/increment");
```

### Can I see statistics from other sites?

**No!** You can only see statistics if you know the exact `siteId` UUID. Each counter is isolated.

### What's the difference between /count and /count/increment?

-   `GET /api/count/:siteId` - **Read-only**, doesn't track the visit, just returns current count
-   `GET /api/count/:siteId/increment` - **Tracks the visit** (increments counter) AND returns the count

Use `/increment` when you want to track every page load, or `/count` when you just want to display the current number without tracking.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

For questions or issues, open an issue on GitHub.

## 🔗 Links

-   **GitHub Repository**: [icastelito/contador-de-visitas](https://github.com/icastelito/contador-de-visitas)
-   **Docker Hub**: Coming soon
-   **Documentation**: [DEPLOY.md](./DEPLOY.md), [AUTO_DEPLOY.md](./AUTO_DEPLOY.md), [DBEAVER.md](./DBEAVER.md)

---

Made with ❤️ using Node.js, PostgreSQL and Docker

**Star ⭐ this repo if you find it useful!**
