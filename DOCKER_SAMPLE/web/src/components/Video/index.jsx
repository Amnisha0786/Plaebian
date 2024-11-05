import React, { useEffect, useRef, useState } from "react";

// hooks
import { useDispatch, useSelector } from "react-redux";

// icons
import { ReactComponent as Audio } from "assets/icons/audio.svg";
import { ReactComponent as AudioMuted } from "assets/icons/audioMuted.svg";
import { ReactComponent as PlayCircle } from "assets/icons/playCircle.svg";
import { ReactComponent as Pause } from "assets/icons/pause.svg";

// styles
import "./styles.scss";

// redux
import { onMute, onUnMute } from "redux/sharedSlices/video";

const Video = ({
  isShowControls = false,
  onEnded = () => {},
  loop = false,
  className = "",
  ...props
}) => {
  const [play, setPlay] = useState(true);
  const isMuted = useSelector((state) => state.video.isMuted);
  const videoRef = useRef(null);

  const dispatch = useDispatch();

  const observerRef = useRef(null);

  useEffect(() => {
    const options = {
      root: null, // Use the viewport as the root
      threshold: 0.5, // Trigger when at least 50% of the video is visible
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);
    observerRef.current.observe(videoRef?.current);

    return () => {
      // Cleanup the observer when the component unmounts
      observerRef.current.disconnect();
    };
  }, []);

  const handleIntersection = (entries) => {
    entries.forEach((entry) => {
      if (videoRef?.current) {
        if (entry.isIntersecting) {
          // Video is visible, play it
          videoRef?.current?.play();
        } else {
          // Video is outside the viewport, pause it
          videoRef?.current?.pause();
        }
      }
    });
  };

  const onClickPlayPause = () => {
    if (videoRef?.current) {
      if (play) {
        videoRef?.current?.pause();
        setPlay(false);
      } else {
        videoRef?.current?.play();
        setPlay(true);
      }
    }
  };

  const onEndVideo = () => {
    setPlay(false);
    onEnded();
  };

  return (
    <div className="relative">
      {isShowControls && (
        <div className="controls">
          <button
            onClick={(e) => {
              e.stopPropagation();
              return isMuted ? dispatch(onUnMute()) : dispatch(onMute());
            }}
          >
            {isMuted ? <AudioMuted /> : <Audio />}
          </button>

          <button onClick={onClickPlayPause}>
            {play ? <Pause /> : <PlayCircle />}
          </button>
        </div>
      )}
      <video
        ref={videoRef}
        src={props?.src}
        {...props}
        className={className}
        muted={isMuted}
        autoPlay
        loop={loop}
        width={props.width || 300}
        height={props.height || 400}
        onEnded={onEndVideo}
        playsInline
      />
    </div>
  );
};

export default Video;
