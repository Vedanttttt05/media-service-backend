# Media Service Backend 🚀

A robust backend service built with Node.js for managing various media-related functionalities. This project provides a scalable and efficient API for handling user authentication, media uploads, social interactions, and more.

## Features ⚡

*   **User Authentication**: Secure registration, login, and session management.
*   **Media Uploads**: Seamlessly upload videos, tweets, and other media content with Cloudinary integration.
*   **Social Interactions**:
    *   Comment on videos and tweets.
    *   Like videos, comments, and tweets.
    *   Create and manage playlists.
    *   Subscribe to users.
*   **Content Management**: Efficiently manage and retrieve various media types.
*   **API Error Handling**: Standardized API error responses for a consistent developer experience.
*   **Asynchronous Operations**: Graceful handling of asynchronous tasks using `asyncHandler`.
*   **Database Integration**: MongoDB integration for persistent data storage.
*   **Health Check**: Endpoint to monitor service health.
*   **Code Quality**: Enforced code style using Prettier.

## Tech Stack 📦

*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **MongoDB**: NoSQL database for data storage.
*   **Mongoose**: ODM (Object Data Modeling) library for MongoDB.
*   **Cloudinary**: Cloud-based image and video management service.
*   **JWT (JSON Web Tokens)**: For secure authentication.
*   **bcrypt**: For password hashing.
*   **Multer**: Middleware for handling `multipart/form-data`, primarily used for file uploads.
*   **dotenv**: Loads environment variables from a `.env` file.
*   **cors**: Middleware to enable Cross-Origin Resource Sharing.
*   **cookie-parser**: Middleware to parse cookies attached to the client request.
*   **nodemon**: Utility that automatically restarts the Node.js application when file changes are detected.
*   **prettier**: An opinionated code formatter.

## Installation 🛠️

Follow these steps to set up the project locally:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/yourusername/media-service-backend.git
    cd media-service-backend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root directory and populate it with the following variables:

    ```env
    PORT=8000
    MONGODB_URI=mongodb://localhost:27017/your_db_name
    CLOUD_NAME=<your_cloudinary_cloud_name>
    API_KEY=<your_cloudinary_api_key>
    API_SECRET=<your_cloudinary_api_secret>
    ACCESS_TOKEN_SECRET=<your_jwt_access_token_secret>
    ACCESS_TOKEN_EXPIRY=<your_jwt_access_token_expiry>
    REFRESH_TOKEN_SECRET=<your_jwt_refresh_token_secret>
    REFRESH_TOKEN_EXPIRY=<your_jwt_refresh_token_expiry>
    CORS_ORIGIN=http://localhost:3000 # Or your frontend origin
    ```
    *Replace placeholders with your actual credentials and settings.*

4.  **Start the Development Server**:
    ```bash
    npm run dev
    ```
    This will start the server in development mode using `nodemon`, which will automatically restart the server on code changes.

## Usage 🧑‍💻

Once the server is running, you can interact with the API endpoints. Here are a few examples:

**Example: User Registration**

```http
POST /api/v1/users/register
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword123"
}
```

**Example: Upload a Video**

```http
POST /api/v1/videos
Authorization: Bearer <your_access_token>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="videoFile"; filename="myvideo.mp4"
Content-Type: video/mp4

...binary video data...
----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="title"

My Awesome Video
----WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="description"

This is a description for my awesome video.
----WebKitFormBoundary7MA4YWxkTrZu0gW--
```

*Refer to the API documentation (if available) for a complete list of endpoints and their request/response formats.*

## Project Structure 📁

```
.
├── public/
│   └── temp/               # Temporary storage for uploaded files
├── src/
│   ├── controllers/        # Handles request logic and business operations
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── healthcheck.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   ├── db/                 # Database connection and models
│   │   └── index.js        # Database connection logic
│   ├── middlewares/        # Custom middleware functions
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   │   └── ownership.middleware.js
│   ├── models/             # Mongoose schemas for database models
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   ├── tweet.model.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/             # Defines API routes and maps them to controllers
│   │   ├── comment.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── healthcheck..routes.js
│   │   ├── likes.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   ├── utils/              # Utility functions and helpers
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── app.js              # Express application setup
│   ├── constants.js        # Project-wide constants
│   └── index.js            # Application entry point, starts the server
├── .env                    # Environment variables
├── .gitignore              # Specifies intentionally untracked files
├── package-lock.json       # Records exact dependency versions
├── package.json            # Project metadata and dependencies
└── prettier.config.js      # Prettier configuration file (if present)
```

## Configuration 🧾

The project relies on environment variables defined in a `.env` file located at the root of the project. These variables configure essential aspects of the application:

*   `PORT`: The port on which the server will listen.
*   `MONGODB_URI`: The connection string for your MongoDB database.
*   `CLOUD_NAME`, `API_KEY`, `API_SECRET`: Cloudinary credentials for media storage.
*   `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY`: JWT secret and expiry for access tokens.
*   `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY`: JWT secret and expiry for refresh tokens.
*   `CORS_ORIGIN`: The allowed origin for Cross-Origin Resource Sharing requests.

## Contributing 🤝

We welcome contributions to `media-service-backend`! If you'd like to contribute, please follow these guidelines:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix (`git checkout -b feature/AmazingFeature`).
3.  **Make your changes** and ensure they adhere to the project's coding style.
4.  **Commit your changes** (`git commit -m 'Add some AmazingFeature'`).
5.  **Push to the branch** (`git push origin feature/AmazingFeature`).
6.  **Open a Pull Request**.

Please ensure you have tested your changes thoroughly before submitting a pull request.

## License 📄

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.