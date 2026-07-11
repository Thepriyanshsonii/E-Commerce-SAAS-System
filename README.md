# BharatBasket local setup guide

Follow these steps to run both the **Backend** and the **Frontend** of your website locally on your computer.

---

## Prerequisites
1. **MySQL**: Make sure MySQL server is installed and running on your system.
2. **Node.js**: Make sure Node.js (which includes `npm`) is installed.
3. **Python**: Make sure Python 3 is installed.

---

## Step 1: Database Setup

1. Open your terminal or MySQL command-line tool.
2. Log in to your MySQL server and create the database named `bharatbasket`:
   ```sql
   CREATE DATABASE IF NOT EXISTS bharatbasket;
   ```
   *(Ensure your database credentials in `.env` match your local MySQL configuration).*

---

## Step 2: Set Up and Run the Backend

1. **Open a terminal window** and navigate to the project root directory:
   ```bash
   cd /home/irshad-mohammad/Videos/BB
   ```

2. **Activate the Python virtual environment**:
   ```bash
   source venv/bin/activate
   ```

3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize and Update the Database Tables**:
   Run the database updater script to automatically build all MySQL tables:
   ```bash
   python backend/update_db.py
   ```

5. **Seed Initial Data** (Optional - if you want dummy products, users, and coupons):
   ```bash
   python backend/seed_db.py
   ```

6. **Start the Flask Backend Server**:
   ```bash
   python -m backend.app
   ```
   *The backend will start running on **`http://localhost:5000`**.*

---

## Step 3: Set Up and Run the Frontend

1. **Open a new terminal window or tab** (do not close the backend terminal).

2. Navigate to the `frontend` folder:
   ```bash
   cd /home/irshad-mohammad/Videos/BB/frontend
   ```

3. **Install the frontend dependencies**:
   ```bash
   npm install
   ```

4. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

5. **Open the site in your browser**:
   Vite will output a URL (usually **`http://localhost:5173`**). Copy and paste this URL into your web browser to open the site.
# ssjewellery_main
