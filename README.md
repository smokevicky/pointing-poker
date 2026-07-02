# Pointing Poker

A modern, premium‑styled **Planning Poker** web application for agile teams to estimate story points collaboratively in real‑time.

---

## ✨ Overview

**Pointing Poker** lets team members cast votes using numeric cards (0 – 8) and expressive emojis (☕ 🤔 😭 🤷 ♾️).  Votes are instantly visible to observers, while only numeric votes contribute to the average calculation.  The UI features a dark‑mode default with smooth glass‑morphic transitions, a light‑mode alternative, and a polished, responsive layout.

---

## 🚀 Key Features

- **Dual‑row voting deck** – numeric cards (0‑8) on the first row, fun emojis on the second row.
- **Instant emoji feedback** – emojis appear immediately for all participants; numeric votes stay hidden until the host clicks **Show Cards**.
- **Dark / Light themes** – toggle via the button in the top‑right corner; default is a deep‑dark mode with vibrant emerald highlights.
- **Real‑time sync** – powered by Firebase Realtime Database; each room tracks users, votes, and history.
- **History log** – previous rounds are archived with average points and individual votes.
- **Responsive design** – works seamlessly on desktop and mobile browsers.
- **One‑click deployment** – Vercel integration for instant production builds.

---

## 📦 Installation & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/smokevicky/pointing-poker.git
   cd pointing-poker
   ```
2. **Install dependencies**
   ```bash
   # Install root dependencies (if any) and client dependencies
   npm install
   npm install --prefix client
   ```
3. **Configure Firebase**
   - Create a Firebase project and enable Realtime Database.
   - Copy the configuration values into a `.env` file at the project root:
     ```dotenv
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```
4. **Run the development server**
   ```bash
   npm run dev          # Starts the Vite dev server for the client
   ```
   Open <http://localhost:5173> to view the app.

---

## 🏗️ Production Build & Deployment

The project is Vercel‑ready. After committing changes to `main`:

```bash
npm run build --prefix client   # Builds the React app into client/dist
cp -r client/dist public        # Copies the build to the root `public` folder for Vercel
vercel --prod                  # Deploys to Vercel (CLI will prompt for login if needed)
```

A live preview is automatically published on every push to `main`.

---

## 👥 Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Make your changes, ensuring the UI remains consistent with the design language.
4. Run `npm test` (if tests exist) and lint using `npm run lint`.
5. Open a pull request against `main`.

Please adhere to the existing coding style and add documentation for any new components.

---

## 📄 License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

## 🙏 Acknowledgements

- **Lucide React** – icon library used for UI controls.
- **Firebase** – real‑time data synchronization.
- **Vercel** – effortless deployments.
- **Google Fonts – Inter** – typographic foundation.

---

> **Ready to estimate?**  Create or join a room, pick a card, and watch the team converge on the perfect story point.
