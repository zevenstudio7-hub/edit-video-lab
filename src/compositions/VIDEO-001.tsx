import React from 'react';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {ChunkCaptions} from '../../library/recipes/ChunkCaptions';
import {PresenterCamera} from '../../library/recipes/PresenterCamera';
import {PresetProvider} from '../presets';
import {SupportView} from './video001/Supports';
import type {Video001Props} from './video001/types';

export type {Video001Props, Video001Timeline} from './video001/types';

// VIDEO-001 · #edit-2-pantalla-dividida. Todo lo editorial sale de video-orders/VIDEO-001.json («timeline»):
// esta composición solo pinta planos del presentador, apoyos de la zona superior y subtítulos.
const BG = '#0a0d14';

export const Video001: React.FC<Video001Props> = ({timeline, reviewNotice}) => {
  const {topHeight, source, accent} = timeline;
  const presenterHeight = 1920 - topHeight;
  return (
    <PresetProvider preset="screen-tutorial" overrides={{accentColor: accent}}>
      <AbsoluteFill style={{background: BG}}>
        <div
          style={{
            position: 'absolute', left: 0, top: 0, width: 1080, height: topHeight, overflow: 'hidden',
            // fondo punteado: guiño a la pizarra de la captura del usuario
            backgroundColor: BG,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1.6px, transparent 1.6px), radial-gradient(ellipse at 80% 0%, rgba(80,110,170,0.28), rgba(10,13,20,0) 60%)',
            backgroundSize: '30px 30px, 100% 100%',
          }}
        >
          {timeline.supports.map((s) => (
            <Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationInFrames} premountFor={30} name={`Apoyo ${s.id} · ${s.kind}`}>
              <SupportView support={s} zoneWidth={1080} zoneHeight={topHeight} accent={accent} />
            </Sequence>
          ))}
        </div>
        <div style={{position: 'absolute', left: 0, top: topHeight, width: 1080, height: presenterHeight, overflow: 'hidden', background: '#000'}}>
          {timeline.cuts.map((c) => (
            <Sequence key={c.id} from={c.startFrame} durationInFrames={c.durationInFrames} premountFor={45} name={`${c.id} · ${c.block}`}>
              <PresenterCamera
                shot={{src: staticFile(c.source), trimBefore: c.trimBefore, trimAfter: c.trimAfter, durationInFrames: c.durationInFrames, scale: c.scale, focus: c.focus, push: c.push, revealFrom: c.revealFrom, punches: c.punches}}
                sourceWidth={source.width} sourceHeight={source.height} zoneWidth={1080} zoneHeight={presenterHeight}
              />
            </Sequence>
          ))}
          <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.18), transparent 14%, transparent 60%, rgba(0,0,0,0.55))', pointerEvents: 'none'}} />
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: topHeight - 2, height: 4, background: accent, opacity: 0.85}} />
        <ChunkCaptions chunks={timeline.captions} centerY={1572} fontSize={66} serif emphasisStyle="color-italic" style={{left: 508, letterSpacing: '-0.02em'}} />
        {reviewNotice ? (
          <div style={{position: 'absolute', top: 18, left: 24, right: 24, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: 1, color: '#ffdf9b', background: 'rgba(0,0,0,0.78)', padding: '10px 18px', borderRadius: 8, pointerEvents: 'none'}}>{reviewNotice}</div>
        ) : null}
      </AbsoluteFill>
    </PresetProvider>
  );
};
