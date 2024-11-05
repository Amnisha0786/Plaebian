import { useEffect, useRef } from "react";

const VideoPreview = ({ stream, className }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
    return null;
  }

  return (
    <video
      ref={videoRef}
      className={className}
      width={500}
      height={500}
      autoPlay
      playsInline
    />
  );
};
export default VideoPreview;
