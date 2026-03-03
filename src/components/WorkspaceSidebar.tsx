import {
    Aperture,
    Figma,
    Framer,
    Gamepad2,
    Mail,
    MonitorSmartphone,
    Slack,
    Trello
} from "lucide-react";

export const WorkspaceSidebar = () => {
    return (
        <div className="w-[72px] flex flex-col items-center py-4 bg-[#141418] border-r border-[#1e1e24] shrink-0 z-20">
            {/* Window controls mockup */}
            <div className="flex gap-1.5 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>

            <div className="flex flex-col gap-4 items-center overflow-y-auto no-scrollbar flex-1">
                {/* Workspaces */}
                <button className="h-10 w-10 rounded-full bg-linear-to-br from-pink-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 hover:scale-105 transition-transform">
                    <span className="font-bold text-[18px] italic tracking-tighter pr-0.5">in</span>
                </button>
                <button className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white hover:scale-105 transition-transform">
                    <Slack className="h-5 w-5" />
                </button>
                <button className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform overflow-hidden p-2.5">
                    <Figma className="h-full w-full" />
                </button>
                <button className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center text-white hover:scale-105 transition-transform">
                    <MonitorSmartphone className="h-5 w-5" />
                </button>
                <div className="h-10 w-10 relative">
                    <button className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center text-white hover:scale-105 transition-transform">
                        <Aperture className="h-5 w-5" />
                    </button>
                    {/* Badge */}
                    <div className="absolute -top-1 -right-1 h-[18px] min-w-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 border-[3px] border-[#141418]">
                        3
                    </div>
                </div>
                <button className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-105 transition-transform">
                    <Gamepad2 className="h-5 w-5" />
                </button>
                <button className="h-10 w-10 rounded-full bg-[#1e1e24] text-white flex items-center justify-center hover:scale-105 transition-transform">
                    <Trello className="h-5 w-5" />
                </button>
                <button className="h-10 w-10 rounded-full bg-linear-to-tr from-yellow-400 to-red-500 flex items-center justify-center text-white hover:scale-105 transition-transform">
                    <Framer className="h-5 w-5" />
                </button>
                <button className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform">
                    <Mail className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};
