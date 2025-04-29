# 🎬 PakTube Backend Project (YouTube Clone)

**PakTube** is a comprehensive backend application that emulates the core functionalities of YouTube. Built with modern technologies, it offers features like user authentication, video management, tweet integration, subscriptions, playlists, and more.

---

## 🚀 Features

- **User Authentication**
  - Secure registration and login
  - Access and refresh token implementation
  - Update user details and passwords

- **Video Management**
  - Full CRUD operations for videos
  - Like and view tracking
  - Comment system with full CRUD
  - Dashboard with channel statistics (total videos, likes, views)

- **Tweet Integration**
  - Full CRUD operations for tweets
  - Like functionality for tweets

- **Subscription System**
  - Subscribe/unsubscribe to channels
  - Retrieve subscriber lists

- **Playlist Management**
  - Create, update, delete playlists
  - Add or remove videos from playlists

- **Likes System**
  - Like functionality for videos, tweets, and comments
  - Retrieve liked videos

---

## 🛠️ Tech Stack

- **Languages & Frameworks**: JavaScript, Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Handling**: Multer for file uploads
- **Media Storage**: Cloudinary integration
- **Data Handling**: Mongoose Aggregation and Pagination

---

## 📚 API Endpoints

### User Endpoints (Controller: `user.controllers.js`)
- `POST /api/v1/users/register`: Register a new user.
- `POST /api/v1/users/login`: Login a user.
- `POST /api/v1/users/logout`: Logout the current user.
- `POST /api/v1/users/refreshToken`: Refresh access token.
- `POST /api/v1/users/changeCurrentPassword`: Change the current user's password.
- `GET /api/v1/users/getCurrnetUser`: Get the current logged-in user's details.
- `PATCH /api/v1/users/updateAccountDetails`: Update user account details.
- `PATCH /api/v1/users/updateAvatarImage`: Update user avatar.
- `PATCH /api/v1/users/changeCoverImage`: Update user cover image.
- `GET /api/v1/users/channel/:username`: Get a user's channel profile.
- `GET /api/v1/users/getWatchHistory`: Get the user's watch history.

### Video Endpoints (Controller: `video.controllers.js`)
- `GET /api/v1/videos`: Get all videos.
- `POST /api/v1/videos`: Publish a new video.
- `GET /api/v1/videos/:videoId`: Get a video by ID.
- `DELETE /api/v1/videos/:videoId`: Delete a video by ID.
- `PATCH /api/v1/videos/:videoId`: Update video details.
- `PATCH /api/v1/videos/:videoId`: Update video thumbnail.
- `PATCH /api/v1/videos/toggle/publish/:videoId`: Toggle video publish status.

### Tweet Endpoints (Controller: `tweet.controllers.js`)
- `POST /api/v1/tweets/createTweet`: Create a new tweet.
- `GET /api/v1/tweets/user/:userId`: Get all tweets by a user.
- `PATCH /api/v1/tweets/:tweetId`: Update a tweet.
- `DELETE /api/v1/tweets/:tweetId`: Delete a tweet.

### Subscription Endpoints (Controller: `subscription.controllers.js`)
- `POST /api/v1/subscriptions/c/:channelId`: Subscribe/unsubscribe to a channel.
- `GET /api/v1/subscriptions/c/:channelId`: Get subscribers of a channel.
- `GET /api/v1/subscriptions/u/:subscriberId`: Get channels subscribed by a user.

### Playlist Endpoints (Controller: `playlist.controllers.js`)
- `POST /api/v1/playlists`: Create a new playlist.
- `GET /api/v1/playlists/:playlistId`: Get a playlist by ID.
- `PATCH /api/v1/playlists/:playlistId`: Update a playlist.
- `DELETE /api/v1/playlists/:playlistId`: Delete a playlist.
- `PATCH /api/v1/playlists/add/:videoId/:playlistId`: Add a video to a playlist.
- `PATCH /api/v1/playlists/remove/:videoId/:playlistId`: Remove a video from a playlist.
- `GET /api/v1/playlists/user/:userId`: Get all playlists of a user.

### Like Endpoints (Controller: `like.controllers.js`)
- `POST /api/v1/likes/toggle/v/:videoId`: Like/unlike a video.
- `POST /api/v1/likes/toggle/c/:commentId`: Like/unlike a comment.
- `POST /api/v1/likes/toggle/t/:tweetId`: Like/unlike a tweet.
- `GET /api/v1/likes/videos`: Get all liked videos.

### Comment Endpoints (Controller: `comment.controllers.js`)
- `GET /api/v1/comments/:videoId`: Get all comments for a video.
- `POST /api/v1/comments/:videoId`: Add a comment to a video.
- `PATCH /api/v1/comments/c/:commentId`: Update a comment.
- `DELETE /api/v1/comments/c/:commentId`: Delete a comment.

### Dashboard Endpoints (Controller: `dashboard.controllers.js`)
- `GET /api/v1/dashboard/stats`: Get channel statistics.
- `GET /api/v1/dashboard/videos`: Get all videos uploaded by the channel.

### Healthcheck Endpoint (Controller: `healthcheck.controllers.js`)
- `GET /api/v1/healthcheck`: Check the health of the application.

---

## 📦 Installation Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/paktube-backend.git
   cd paktube-backend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the following:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ACCESS_TOKEN_SECRET=your_access_token_secret
   ACCESS_TOKEN_EXPIRY=1h
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Run the Application**

   ```bash
   npm run dev
   ```

5. **Access the Application**

   The application will be running at `http://localhost:5000`.

---

## 🧪 Testing

Use tools like Postman or Thunder Client to test the API endpoints. Ensure you include the required headers and body parameters as specified in the API documentation.

---

## 📄 License

This project is licensed under the ISC License.
