#  Sip-Social  

Sip-Social is a **full-stack social media platform** inspired by Twitter and YouTube, built with the **MERN stack + Redux Toolkit**.  
It allows users to **share thoughts, interact, and engage** — all while showcasing clean architecture, efficient API handling, and scalable design patterns.  

##  Features  

###  Authentication & Users  
- Secure **JWT authentication** (access + refresh tokens stored in cookies).  
- Full **user account management**: signup, login, logout.  
- **Profile editing** with avatar & cover uploads (via Cloudinary).  
- **Watch history** and subscription tracking.  

###  Tweets & Posts  
- Create, edit, and delete tweets/posts.  
- Like/unlike tweets with **real-time UI updates**.  
- Add, fetch, and delete **comments** seamlessly.  
- Clean slice-based state management using **Redux Toolkit**.  

###  Videos (YouTube-like)  
- Upload and publish videos with **thumbnails & duration extraction (ffmpeg)**.  
- Video feed with sorting, pagination, and filtering.  
- Explore and Subscriptions pages powered by optimized queries.  
- Aggregated video fetch with user/channel info.  

###  Subscriptions & Channels  
- Subscribe/unsubscribe to channels.  
- Personalized subscriptions feed.  
- Channel-specific pages showing uploaded content.  

###  Frontend  
- **React + TailwindCSS** with support for **light/dark mode**.  
- Coffee-themed UI with clean, minimal layouts.  
- **Nav + BottomNav components** for a native-app feel.  
- **Redux slices** for users, tweets, videos, channels, and explore.  

---

##  Flow  

1. **Authentication** → Users sign in with secure JWT tokens, enabling personalized feeds.  
2. **Tweets & Videos** → Users create posts or upload videos. State is synced instantly across the app.  
3. **Engagement** → Like, comment, and subscribe using optimized endpoints (`/likes`, `/comments`, `/subscriptions`).  
4. **Exploration** → Discover new content via the Explore feed, powered by backend aggregation pipelines.  
5. **Subscriptions** → Stay updated with favorite channels and creators.  

The project follows a **clear separation of concerns**:
- **Backend**: RESTful API with Express, MongoDB, Mongoose, Cloudinary, and ffmpeg.  
- **Frontend**: React + Redux Toolkit + TailwindCSS.  
- **State flow**: All async logic handled with `createAsyncThunk`, ensuring predictable updates.  

---

##  Why It Stands Out  

- **Efficiency**: Backend endpoints are clean, modular, and aggregation-friendly.  
- **Scalability**: Uses Redux Toolkit for centralized state management — easily extendable.  
- **Creativity**: Coffee-themed UI with a cozy light/dark mode switch.  
- **Real-World Ready**: Implements features you’d expect from Twitter + YouTube hybrids.  

---

##  Tech Stack  

- **Frontend**: React, Redux Toolkit, TailwindCSS  
- **Backend**: Node.js, Express, MongoDB, Mongoose  
- **Media**: Cloudinary (uploads), ffmpeg (duration & thumbnails)  
- **Auth**: JWT (access + refresh tokens in cookies)  

---

##  Project Structure  

```bash
Sip-Social/
├── backend/   # Express REST API (users, tweets, videos, likes, comments, subs)
├── frontend/  # React + Redux + Tailwind (UI + state slices)
└── README.md
