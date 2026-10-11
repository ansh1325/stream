import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="absolute right-20 top-3 z-30 flex items-center">
      <button
        onClick={handleVideoCall}
        className="btn btn-success btn-sm text-white shadow-md flex items-center gap-1.5 hover:scale-105 transition-all"
        title="Start Video Call"
        type="button"
      >
        <VideoIcon className="size-4" />
        <span className="hidden sm:inline text-xs font-semibold">Video Call</span>
      </button>
    </div>
  );
}

export default CallButton;