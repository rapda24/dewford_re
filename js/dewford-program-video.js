/* Start muted program videos only while they are in the viewport. */
(() => {
  const videos=new Set();
  const visible=new Set();
  function sync(video) {
    if (!visible.has(video)||document.hidden) {video.autoplay=false;video.pause();return;}
    video.autoplay=true;
    video.muted=true;
    video.play()?.catch(()=>{}); // Playback controls remain available if autoplay is blocked.
  }
  const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{
    entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target);sync(entry.target);
  }),{threshold:0}):null;
  function register(video){
    if(videos.has(video))return;
    videos.add(video);video.autoplay=false;video.pause();
    video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;
    video.setAttribute('muted','');video.setAttribute('loop','');video.setAttribute('playsinline','');
    if(video.classList.contains('dewford-program-video-portrait'))video.addEventListener('loadedmetadata',()=>{
      if(video.videoWidth&&video.videoHeight)video.style.aspectRatio=`${video.videoWidth} / ${video.videoHeight}`;
    });
    observer?.observe(video);
  }
  const check=()=>videos.forEach(video=>{const rect=video.getBoundingClientRect();rect.bottom>0&&rect.top<innerHeight?visible.add(video):visible.delete(video);sync(video);});
  function discover(){document.querySelectorAll('video').forEach(register);if(!observer)check();}
  discover();
  new MutationObserver(()=>{
    videos.forEach(video=>{if(!video.isConnected){observer?.unobserve(video);video.pause();videos.delete(video);visible.delete(video);}});discover();
  }).observe(document.body,{childList:true,subtree:true});
  if(!observer){window.addEventListener('scroll',check,{passive:true});window.addEventListener('resize',check);}
  document.addEventListener('visibilitychange',()=>videos.forEach(sync));
})();
