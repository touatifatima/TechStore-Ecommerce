# TechStore Ecommerce

A server-rendered ecommerce demo built with **Node.js, Express, EJS, and MySQL**. TechStore provides a foundation for a computer hardware and IT equipment storefront, with product browsing, search, product details, and cookie-based cart management.

The current version is a development prototype. The included database contains sample clothing products, ready to be replaced with your own technology catalog.

![TechStore storefront](Screenshots/storefront-desktop.png)

[View the mobile layout](Screenshots/storefront-mobile.png)

## Features

- MySQL-backed product catalog and product details.
- Product search by title.
- Shopping cart with quantity updates, item removal, and clearing.
- Product statistics dashboard.
- Responsive storefront with a shared navy-and-blue design, custom CSS, and mobile navigation.
- Client-side category filters and price/name sorting.
- Clear bag totals, image fallbacks, and friendly empty and error states.
- Authentication, administration, and checkout scaffolding for further development.

## Technology stack

| Layer | Technology |
| --- | --- |
| Runtime and server | Node.js, Express |
| Templates and interface | EJS, custom responsive CSS, vanilla JavaScript |
| Database | MySQL, mysql2 |
| Configuration and development | dotenv, nodemon |

## Run locally

### 1. Prerequisites

Install Node.js with npm, Git, and MySQL. Start your MySQL server before running the app. Local setup uses Node.js 22.14.0, npm 10.9.2, and MySQL 8.0.

### 2. Clone and install

```bash
git clone https://github.com/touatifatima/TechStore-Ecommerce.git
cd TechStore-Ecommerce
npm install
```

If the project is already in `C:\Users\lenovo\OneDrive\Desktop\techstore`, open a terminal there instead of cloning again.

### 3. Configure the environment

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```dotenv
PORT=7000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-local-mysql-password
DB_NAME=jsp_eCommerce
SESSION_SECRET=replace-with-a-long-random-string
```

Use an empty password only if your MySQL account has no password. `.env` is ignored by Git. Keep your credentials local.

### 4. Import sample data

```bash
npm run db:setup
```

The script creates the configured database and imports `sql/ecommerce.sql`, including the `categories`, `pages`, and `products` tables. Your MySQL account needs database and table creation permissions. It refuses to import into a database containing existing tables to preserve your data. Run this once for a fresh installation; skip it when restarting an initialized project.

Alternatively, create an empty `jsp_eCommerce` database in MySQL Workbench or phpMyAdmin, select it, and import `sql/ecommerce.sql`.

### 5. Start the app

```bash
npm start
```

Open **http://localhost:7000**. For automatic restarts during development:

```bash
npm run dev
```

Press `Ctrl+C` to stop. If you change `PORT`, use the new port in your browser.

## Local pages

| URL | Purpose |
| --- | --- |
| `/` | Home page |
| `/shop` | Product catalog |
| `/product/1` | Example product |
| `/search` | Product search |
| `/cart` | Shopping cart |
| `/dashboard` | Product statistics |

## Project structure

```text
controllers/       Authentication controller
database/          Shared MySQL connection
public/            Static styles, scripts, and images
routers/           Express routes
scripts/           Local database setup
sql/               Sample schema and catalog
views/             EJS pages and partials
Screenshots/       Original project images
.env.example       Environment configuration template
index.js           Application entry point
```

## Development status

The storefront, search, product details, bag, informational pages, and dashboard share a responsive design. Category filtering, sorting, and bag updates are functional. The included clothing catalog is unchanged.

Account screens show the planned interface with sign-in and registration disabled: the supplied SQL does not include the `user` table, and the inherited controller still requires password handling and session improvements. The catalog overview is read-only; legacy editing routes require further work. Checkout previews delivery details locally and does not save personal information, collect payments, or place orders.

The inherited dependency tree has npm audit findings. Review dependency upgrades, query parameterization, authentication, and authorization before public deployment. This version is intended for local development and learning.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ECONNREFUSED` | Start MySQL; verify `DB_HOST` and `DB_PORT`. |
| `ER_ACCESS_DENIED_ERROR` | Check the MySQL username, password, and permissions. |
| Unknown database or missing catalog tables | Run `npm run db:setup` against an empty database. |
| Setup reports existing tables | Use the initialized database, or choose a new empty `DB_NAME`. |
| `EADDRINUSE` | Stop the process using the port or change `PORT` in `.env`. |
| Missing fonts or product photos while offline | Fonts and original product photos use external hosts; system fonts and a local image placeholder provide fallbacks. |

## Credits

Based on [eCommerce-TOUATI-TOUAK](https://github.com/touatifatima/eCommerce-TOUATI-TOUAK). Maintained as [TechStore-Ecommerce](https://github.com/touatifatima/TechStore-Ecommerce).
