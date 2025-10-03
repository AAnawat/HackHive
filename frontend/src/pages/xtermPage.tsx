import Xterm from "../components/xterm";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

export default function XtermPage() {
    const { user } = useAuth();

    return (
        <ProtectedRoute>
            <AppLayout>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Terminal</h1>
                            <p className="text-neutral-400 text-sm">
                                Welcome, <span className="text-yellow-400">{user?.username}</span>. Use this terminal to solve challenges.
                            </p>
                        </div>
                    </div>
                    
                    <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden" style={{ height: 'calc(100vh - 250px)' }}>
                        <Xterm host="http://localhost:1234" />
                    </div>
                    
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                        <p className="text-sm text-neutral-300">
                            <strong className="text-yellow-400">Tip:</strong> This terminal is connected to a containerized environment. 
                            Use it to explore files, run commands, and solve CTF challenges.
                        </p>
                    </div>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}