# youtube-like-backend 🚀

This project is a robust Node.js backend API designed to power a YouTube-like video sharing platform. It handles user authentication, video management, comments, likes, playlists, subscriptions, and even social media-like tweets, all while ensuring data integrity and efficient communication with a MongoDB database.

## Features ⚡

*   **User Authentication**: Secure registration, login, and JWT-based authentication.
*   **Video Management**: Upload, retrieve, update, and delete videos. Supports video processing and storage using Cloudinary.
*   **Comment System**: Users can add, retrieve, update, and delete comments on videos.
*   **Likes/Unlikes**: Users can like and unlike videos and comments.
*   **Playlists**: Create, manage, and retrieve user-created playlists.
*   **Subscriptions**: Follow and unfollow other users.
*   **Tweets**: A micro-blogging feature for users to share short updates.
*   **Dashboard API**: Provides aggregated data for user dashboards.
*   **Health Check**: An endpoint to monitor the application's health.
*   **Middleware Integration**: Custom middleware for authentication, authorization (ownership checks), and file uploads (Multer).
*   **Error Handling**: Centralized and standardized error handling with `ApiError` and `ApiResponse`.
*   **Database Interaction**: Efficiently interacts with MongoDB using Mongoose.
*   **Configuration Management**: Uses environment variables for sensitive information and configuration.

## Tech Stack 📦

*   **Node.js**: JavaScript runtime environment.
*   **Express.js**: Web application framework for Node.js.
*   **MongoDB**: NoSQL database.
*   **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
*   **bcrypt**: For password hashing.
*   **jsonwebtoken**: For creating and verifying JWTs (JSON Web Tokens).
*   **cloudinary**: For cloud-based image and video storage and manipulation.
*   **multer**: Middleware for handling `multipart/form-data`, primarily used for file uploads.
*   **cors**: Middleware to enable Cross-Origin Resource Sharing.
*   **dotenv**: Loads environment variables from a `.env` file into `process.env`.
*   **cookie-parser**: Middleware to parse cookies.
*   **prettier**: For code formatting.
*   **nodemon**: Utility that automatically restarts the Node.js application when file changes are detected.
*   **mongoose-aggregate-paginate-v2**: For efficient pagination of Mongoose aggregation queries.

## Installation 🛠️

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/youtube-like-backend.git
    cd youtube-like-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and populate it with your configuration. Refer to the **Configuration** section below for required variables.

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    or
    ```bash
    yarn dev
    ```

## Usage 💡

Once the server is running, you can interact with the API using tools like Postman, Insomnia, or by integrating it with your frontend application.

The API exposes various endpoints for different functionalities. Here are a few examples:

*   **User Registration:**
    ```http
    POST /api/v1/users/register
    ```
    **Body:**
    ```json
    {
        "username": "testuser",
        "email": "test@example.com",
        "password": "securepassword"
    }
    ```

*   **User Login:**
    ```http
    POST /api/v1/users/login
    ```
    **Body:**
    ```json
    {
        "email": "test@example.com",
        "password": "securepassword"
    }
    ```

*   **Upload Video:** (Requires authentication token in cookies/headers)
    ```http
    POST /api/v1/videos
    Content-Type: multipart/form-data
    ```
    **Form Data:**
    *   `videoFile`: The video file.
    *   `thumbnail`: The thumbnail image.
    *   `title`: Video title.
    *   `description`: Video description.
    *   `isPublished`: Boolean (true/false).

*   **Get All Videos:**
    ```http
    GET /api/v1/videos
    ```

**Note:** All protected routes require a valid JWT, typically sent via cookies or the `Authorization` header.

## Project Structure 📁

```
youtube-like-backend/
├── public/
│   └── temp/            # Temporary storage for uploaded files
├── src/
│   ├── controllers/     # Handles business logic for API endpoints
│   │   ├── comment.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── healthcheck.controller.js
│   │   ├── like.controller.js
│   │   ├── playlist.controller.js
│   │   ├── subscription.controller.js
│   │   ├── tweet.controller.js
│   │   ├── user.controller.js
│   │   └── video.controller.js
│   ├── db/              # Database connection logic
│   │   └── index.js
│   ├── middlewares/     # Custom Express middleware
│   │   ├── auth.middleware.js
│   │   ├── multer.middleware.js
│   │   └── ownership.middleware.js
│   ├── models/          # Mongoose schemas and models
│   │   ├── comment.model.js
│   │   ├── like.model.js
│   │   ├── playlist.model.js
│   │   ├── subscription.model.js
│   │   ├── tweet.model.js
│   │   ├── user.model.js
│   │   └── video.model.js
│   ├── routes/          # Express route definitions
│   │   ├── comment.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── healthcheck.routes.js
│   │   ├── likes.routes.js
│   │   ├── playlist.routes.js
│   │   ├── subscription.routes.js
│   │   ├── tweet.routes.js
│   │   ├── user.routes.js
│   │   └── video.routes.js
│   ├── utils/           # Utility functions and classes
│   │   ├── apiError.js
│   │   ├── apiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── app.js           # Express application setup
│   ├── constants.js     # Application-wide constants
│   └── index.js         # Application entry point
├── .env                 # Environment variables
├── .gitignore           # Files to ignore by Git
├── package-lock.json    # npm package lock file
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation
```

## Configuration ⚙️

The application relies on environment variables for configuration. Create a `.env` file in the root of the project with the following variables:

*   `PORT`: The port on which the server will run (e.g., `8000`).
*   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/youtube-like-app`).
*   `DB_NAME`: The name of your database (e.g., `youtube-like-app`).
*   `JWT_SECRET`: A strong, secret key for signing JWTs.
*   `JWT_EXPIRY`: Expiry time for JWTs (e.g., `1d` for 1 day).
*   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name.
*   `CLOUDINARY_API_KEY`: Your Cloudinary API key.
*   `CLOUDINARY_API_SECRET`: Your Cloudinary API secret.
*   `CORS_ORIGIN`: The origin allowed for CORS requests (e.g., `http://localhost:3000` for a local frontend).

**Example `.env` file:**

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/youtube-like-app
DB_NAME=youtube-like-app
JWT_SECRET=your_super_secret_jwt_key_change_me
JWT_EXPIRY=1d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CORS_ORIGIN=http://localhost:3000
```

## Contributing 🤝

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's coding style and includes relevant tests.

## License 📜

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.