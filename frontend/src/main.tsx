import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Link, RouterProvider } from "react-router";
import { AuthProvider } from "./auth/AuthContext";
import { GuestOnly, RequireAuth } from "./auth/guards";
import { Layout } from "./components/Layout";
import { EmptyState } from "./components/ui";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { ChannelPage } from "./pages/ChannelPage";
import { HomePage } from "./pages/HomePage";
import { HistoryPage, LikedVideosPage, SubscriptionsPage } from "./pages/LibraryPages";
import { PlaylistDetailPage, PlaylistsPage } from "./pages/PlaylistPages";
import { SettingsPage } from "./pages/SettingsPage";
import { EditVideoPage, StudioPage, UploadPage } from "./pages/StudioPages";
import { WatchPage } from "./pages/WatchPage";
import "./index.css";

function NotFound() {
  return (
    <EmptyState title="Page not found">
      <Link to="/" className="font-medium text-accent hover:underline">Go home</Link>
    </EmptyState>
  );
}

const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/watch/:videoId", element: <WatchPage /> },
          { path: "/c/:username", element: <ChannelPage /> },
          { path: "/subscriptions", element: <SubscriptionsPage /> },
          { path: "/liked", element: <LikedVideosPage /> },
          { path: "/history", element: <HistoryPage /> },
          { path: "/playlists", element: <PlaylistsPage /> },
          { path: "/playlist/:playlistId", element: <PlaylistDetailPage /> },
          { path: "/studio", element: <StudioPage /> },
          { path: "/studio/:videoId/edit", element: <EditVideoPage /> },
          { path: "/upload", element: <UploadPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "*", element: <NotFound /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
