import { StrictMode, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider, useAuth } from "react-oidc-context";
import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import App from "./App.tsx";
import { oidcConfig } from "./auth.ts";
import { LoginPage } from "./components/LoginPage.tsx";
import "./index.css";
import { DbConnection, ErrorContext } from "./module_bindings/index.ts";

const HOST = import.meta.env.VITE_SPACETIMEDB_HOST ?? "ws://localhost:3000";
const DB_NAME = import.meta.env.VITE_SPACETIMEDB_DB_NAME ?? "quickstart-chat";
const TOKEN_KEY = `${HOST}/${DB_NAME}/auth_token`;

const onConnect = (_conn: DbConnection, identity: Identity, token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    console.log(
        "Connected to SpacetimeDB with identity:",
        identity.toHexString(),
    );
};

const onDisconnect = () => {
    console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: ErrorContext, err: Error) => {
    console.log("Error connecting to SpacetimeDB:", err);
};

function AuthenticatedApp() {
    const auth = useAuth();

    // Use the OIDC token so the same email always resolves to the same identity
    const token = auth.user?.access_token || localStorage.getItem(TOKEN_KEY) || undefined;

    const connectionBuilder = useMemo(
        () =>
            DbConnection.builder()
                .withUri(HOST)
                .withDatabaseName(DB_NAME)
                .withToken(token)
                .onConnect(onConnect)
                .onDisconnect(onDisconnect)
                .onConnectError(onConnectError),
        [token],
    );

    if (!auth.isAuthenticated) {
        return <LoginPage />;
    }

    return (
        <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
            <App />
        </SpacetimeDBProvider>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AuthProvider {...oidcConfig}>
            <AuthenticatedApp />
        </AuthProvider>
    </StrictMode>,
);
