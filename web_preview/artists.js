(function(){
  const carousel = document.getElementById('carousel');
  const prev = document.querySelector('.nav.prev');
  const next = document.querySelector('.nav.next');
  if (!carousel || !prev || !next) return;

  const getStep = () => Math.round(carousel.clientWidth * 0.8);

  prev.addEventListener('click', () => {
    carousel.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    carousel.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  // Enable dragging with mouse/touch
  let isDown = false, startX = 0, scrollLeft = 0;
  const start = (x) => { isDown = true; startX = x; scrollLeft = carousel.scrollLeft; };
  const move = (x) => { if(!isDown) return; const dx = x - startX; carousel.scrollLeft = scrollLeft - dx; };
  const end = () => { isDown = false; };

  carousel.addEventListener('mousedown', (e) => start(e.pageX));
  carousel.addEventListener('mousemove', (e) => move(e.pageX));
  window.addEventListener('mouseup', end);

  carousel.addEventListener('touchstart', (e) => start(e.touches[0].pageX), {passive:true});
  carousel.addEventListener('touchmove', (e) => move(e.touches[0].pageX), {passive:true});
  carousel.addEventListener('touchend', end);
})();
