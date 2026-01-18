export function addHoldListener(
  button: HTMLButtonElement,
  onStep: () => void,
  delay = 120
) {
  let timer: number | null = null;

  const start = () => {
    onStep();
    timer = window.setInterval(onStep, delay);
  };

  const stop = () => {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };

  button.addEventListener("mousedown", start);
  button.addEventListener("mouseup", stop);
  button.addEventListener("mouseleave", stop);
  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    start();
  });
  button.addEventListener("touchend", stop);
}
