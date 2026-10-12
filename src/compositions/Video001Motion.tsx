import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BigStatement} from '../components/BigStatement';

// Frame-driven motion using Remotion's official spring/interpolate primitives.
// Never fade the whole support panel to black at an editorial cut.
export const Video001Motion: React.FC<{
  headline: string;
  scene: number;
  durationInFrames: number;
}> = ({headline, scene, durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = spring({frame, fps, config: {damping: 24, stiffness: 150, mass: 0.9}, durationInFrames: 20});
  const words = headline.split(/\s+/);
  return (
    <div data-motion-panel style={{position: 'relative', width: '100%', height: '100%', padding: '118px 64px 78px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'radial-gradient(ellipse at 90% 15%, #253349 0%, #101824 48%, #0c121b 100%)'}}>
      <div style={{position: 'absolute', top: 105, left: 64, right: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a6beff', fontSize: 23, letterSpacing: 4, fontWeight: 700}}>
        <span>POSICIONAMIENTO</span>
        <span style={{color: '#cfec82', fontVariantNumeric: 'tabular-nums'}}>{String(scene).padStart(2, '0')}</span>
      </div>
      <div style={{translate: `0px ${interpolate(entrance, [0, 1], [24, 0])}px`, scale: interpolate(entrance, [0, 1], [0.97, 1])}}>
        <BigStatement statement={headline} align="left" fontSize={headline.length > 42 ? 70 : 84} highlightWords={words.slice(-2)} highlightVariant="marker" style={{maxWidth: 940, padding: 0, opacity: 1, transform: 'none'}} />
        <div style={{height: 7, width: 190, borderRadius: 4, marginTop: 32, background: '#cfec82', transformOrigin: 'left', scale: `${interpolate(entrance, [0, 1], [0.15, 1])} 1`}} />
      </div>
      <div style={{position: 'absolute', bottom: 58, left: 64, right: 64, height: 3, background: '#ffffff15'}}>
        <div style={{height: '100%', background: '#a6beff', transformOrigin: 'left', scale: `${interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} 1`}} />
      </div>
    </div>
  );
};
