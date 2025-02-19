import { useScramble } from 'use-scramble';

const ScrambleText = ({ text, speed = 0.6, tick = 1 }) => {
  const { ref } = useScramble({
    text: text,
    speed: speed,
    tick: tick,
    chance: 1,
    step: 2,
    scramble: 5,
    range: [97.0, 125.0],
    overdrive: false,
    seed: 1337,
  });

  return <p ref={ref} />;
};

export default ScrambleText;
