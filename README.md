# MechShop Manager

A full-stack inventory and sales management system for vendors, built with Vue.js, Node.js/Express, and MySQL.

---

## Features
- **Authentication:** Secure login/logout with JWT, role-based access (admin/staff)
- **Dashboard:** Live stats (sales, inventory, orders, customers, recent sales)
- **Inventory Management:** Add/edit/delete parts, batch, expiry, low stock alerts
- **Sales & Purchases:** Customer lookup, auto-billing, inventory updates, invoice generation
- **Customers:** Unique membership, phone lookup, purchase history
- **Reports:** Profit, sales, low stock, best-selling items, filters, CSV export
- **Audit Log:** Track all create/update/delete actions (admin only)
- **Notifications:** Send messages to users (admin only)
- **Responsive UI:** Modern, mobile-friendly design with Tailwind CSS

---

## Tech Stack
- **Frontend:** Vue.js (Vite), Tailwind CSS, Bootstrap Icons
- **Backend:** Node.js, Express.js, MySQL, JWT, bcrypt
- **Database:** MySQL (see schema.sql for details)

---

## Getting Started

### 1. Clone the Repository
```sh
git clone https://github.com/yourusername/mechshop-manager.git
cd mechshop-manager
```

### 2. Setup the Backend
```sh
cd mechshop-backend
npm install
```
- Configure your database and environment variables in a `.env` file:
  ```env
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=your_mysql_password
  DB_NAME=mechshop
  JWT_SECRET=your_strong_secret
  ```
- Initialize the database:
  - Run the SQL in `mechshop-backend/schema.sql` using MySQL Workbench or CLI.
- Start the backend server:
  ```sh
  npm start
  ```
  The backend runs on [http://localhost:3001](http://localhost:3001)

### 3. Setup the Frontend
```sh
cd ../mechshop-vue
npm install
npm run dev
```
  The frontend runs on [http://localhost:5173](http://localhost:5173) (default Vite port)

---

## Usage
- Login as admin: `admin` / `admin` (default, change password in production)
- Explore dashboard, manage inventory, sales, purchases, customers, and reports
- Admins can view audit logs and send notifications

---

## Security & Production Notes
- Always set a strong `JWT_SECRET` and MySQL password in production
- Use HTTPS and a secure reverse proxy (e.g., Nginx)
- Regularly back up your database
- Restrict DB and server access to trusted IPs
- Use environment variables for all secrets and credentials

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE) 