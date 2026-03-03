import { MessageSquare } from "lucide-react";

export const WorkspaceSidebar = () => {
    return (
        <div className="w-[72px] flex flex-col items-center py-4 bg-[#141418] border-r border-[#1e1e24] shrink-0 z-20">
            <div className="flex flex-col gap-4 items-center overflow-y-auto no-scrollbar flex-1 pt-4">
                {/* Main Workspace Icon */}
                <div className="relative group">
                    <button className="h-12 w-12 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:rounded-xl transition-all duration-300">
                        <MessageSquare className="h-6 w-6" />
                    </button>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 w-1.5 h-8 bg-white rounded-r-full transition-all duration-300" />
                </div>
            </div>
        </div>
    );
};
