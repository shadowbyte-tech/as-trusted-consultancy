'use client';

import { useAuth } from "@/lib/auth-context";

export default function AuthButtonWrapper({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
