import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from "react";

function VideoPlayer({ video }, ref) {
  // video can be a string URL (embed) or an object { streamUrl, embedUrl }
  const isObject = typeof video === "object" && video !== null;
  const streamUrl = isObject ? video.streamUrl : null;
  const embedUrl = isObject ? video.embedUrl : video;

  const videoRef = useRef(null);
  const [error, setError] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  // Attempt autoplay when the video source changes (useful after selecting a module)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    // If using a stream URL, try to autoplay. Some browsers require muted autoplay.
    if (streamUrl) {
      const tryPlay = async () => {
        try {
          const wasMuted = v.muted;
          v.muted = true;
          await v.play();
          v.muted = wasMuted;
        } catch (e) {
          // autoplay failed; leave paused and show controls
          console.debug("Autoplay failed:", e?.message);
        }
      };
      // reset time to start and attempt play
      try { v.currentTime = 0; } catch (e) {}
      tryPlay();
    }
  }, [streamUrl, embedUrl]);

  useImperativeHandle(ref, () => ({
    getCurrentTime: () => {
      const v = videoRef.current;
      return v ? v.currentTime || 0 : 0;
    },
    getDuration: () => {
      const v = videoRef.current;
      return v ? v.duration || 0 : 0;
    }
  }));

  // If we have a stream URL (raw video bytes from backend), use native player.
  if (streamUrl) {
    return (
      <div className="video-player">
        <div className="video-viewport">
          <video
            ref={videoRef}
            src={streamUrl}
            controls={true}
            poster={isObject ? video.thumbnail : undefined}
            onError={() => setError(true)}
            onLoadedMetadata={() => setError(false)}
            style={{ width: "100%", height: "100%", background: "#000" }}
          />
        </div>

        {error && (
          <div className="video-error">
            <div>Playback error. Try opening the file directly.</div>
            <a href={embedUrl} target="_blank" rel="noreferrer">Open in Drive</a>
          </div>
        )}

      </div>
    );
  }

  // Fallback: embed via iframe (Google Drive preview)
  // For embeds, defer loading the iframe until the user clicks play (avoids cross-origin autoplay issues)
  const posterStyle = isObject && video.thumbnail ? { backgroundImage: `url(${video.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: '#000' };

  return (
    <div className="embed-player ratio ratio-16x9" style={{ position: 'relative' }}>
      {!embedLoaded ? (
        <div className="embed-poster" style={{ ...posterStyle, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button className="embed-play" onClick={() => setEmbedLoaded(true)} style={{ padding: '12px 18px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff' }}>Play</button>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          title="Course Video"
          allowFullScreen
          style={{ border: 0, width: "100%", height: "100%" }}
        ></iframe>
      )}

      <div style={{ position: 'absolute', right: 10, bottom: 10 }}>
        <a href={embedUrl} target="_blank" rel="noreferrer" style={{ color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: 6, textDecoration: 'none' }}>Open in Drive</a>
      </div>
    </div>
  );
}

export default forwardRef(VideoPlayer);
