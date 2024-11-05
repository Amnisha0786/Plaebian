import { useEffect, useRef } from "react";

function VimeoPlayer({ url, setOption, option, handleFullWatch, post, index }) {
  const playerRef = useRef(null);

  useEffect(() => {
    const options = {
      url,
      autoplay: false,
      loop: false,
      muted: true,
      id: url,
    };
    if (option) {
      options["muted"] = false;
    }
    const player = new window.Vimeo.Player(playerRef.current, options);
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            player.play();
            player.on("volumechange", () => {
              player.getVolume().then((res) => {
                if (res) {
                  setOption(true);
                } else {
                  setOption(false);
                }
              });
            });
            player.on("ended", () => {
              handleFullWatch(post, index);
            });
          } else {
            player.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    intersectionObserver.observe(playerRef.current);

    return () => {
      player.unload();
      intersectionObserver.disconnect();
    };
  }, [url]);

  return <div ref={playerRef}></div>;
}

export default VimeoPlayer;
