# 📝 Real-Time Collaborative Text Editor

This is a simple collaborative text editor where **two people can edit the same document at the same time**. It’s built using **React**, **Slate.js**, and **Socket.IO** to sync the changes in real-time.

Right now, it supports real-time editing with basic formatting. The goal is to make it easy for people to write together, live!

---

## 🔧 What I’ve Used (Tech Stack)

### Frontend:
- **React.js** – for the main user interface
- **Slate.js** – for rich text editing (like bold, headings, etc.)
- **Socket.IO (client)** – to send and receive real-time updates

### Backend:
- **Node.js** with **Express.js** – handles server logic
- **Socket.IO (server)** – sends document changes to all connected users

---

## ✅ What Works Now

- Two users can edit the same document at the same time
- Changes show up instantly on both screens

---

## 🧪 How It Works (in simple terms)

1. One user creates a room (a document).
2. Another user joins using the same room code.
3. When someone types or edits something, that change is sent through **WebSockets** using **Socket.IO**.
4. Everyone in the room sees the updated text in real-time.

---
## ▶️ How to Run It

### 1. Clone the repo:
```bash
git clone https://github.com/ash-k121/Text_Editor.git
cd Text_Editor
```
### 2. Backend
```bash
cd backend
npm install
node index.js
```
### 3. Frontend
```bash
cd frontend
npm run dev
```
