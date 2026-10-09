# TechStore Ecommerce

A server-rendered ecommerce demo built with **Node.js, Express, EJS, and MySQL**. TechStore provides a foundation for a computer hardware and IT equipment storefront, with product browsing, search, product details, and cookie-based cart management.

The current version is a development prototype. The included database contains sample clothing products, ready to be replaced with your own technology catalog.

## Features

- MySQL-backed product catalog and product details.
- Product search by title.
- Shopping cart with quantity updates, item removal, and clearing.
- Product statistics dashboard.
- Responsive layouts using Bootstrap 4.
- Authentication, administration, and checkout scaffolding for further development.

## Technology stack

| Layer | Technology |
| --- | --- |
| Runtime and server | Node.js, Express |
| Templates and interface | EJS, Bootstrap 4, CSS, JavaScript |
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

Product browsing and cart flows form the core demo. Home and informational pages still include starter content. Authentication needs further work: the supplied SQL does not include the `user` table, and the controller requires password handling and session improvements. Administration routes require fixes to database references and template paths. Checkout is a prototype without a completed payment or order workflow.

The inherited dependency tree has npm audit findings. Review dependency upgrades, query parameterization, authentication, and authorization before public deployment. This version is intended for local development and learning.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ECONNREFUSED` | Start MySQL; verify `DB_HOST` and `DB_PORT`. |
| `ER_ACCESS_DENIED_ERROR` | Check the MySQL username, password, and permissions. |
| Unknown database or missing catalog tables | Run `npm run db:setup` against an empty database. |
| Setup reports existing tables | Use the initialized database, or choose a new empty `DB_NAME`. |
| `EADDRINUSE` | Stop the process using the port or change `PORT` in `.env`. |
| Missing styles while offline | Some interface assets load from external CDNs. |

## Credits

Based on [eCommerce-TOUATI-TOUAK](https://github.com/touatifatima/eCommerce-TOUATI-TOUAK). Maintained as [TechStore-Ecommerce](https://github.com/touatifatima/TechStore-Ecommerce).
