import React from 'react';
import { FlexWidget, OverlapWidget, SvgWidget, TextWidget } from 'react-native-android-widget';

// The home-screen widget: the day's dial (96 quarter-hour dots, spent ones faded) with the
// breaths left, and up to three of your people. A widget can't be held, so giving takes two
// taps: the first asks "Tap again", the second sends.

const LIGHT = { bg: '#F5F1EA', ink: '#1B1A18', muted: '#5E5953', accent: '#2D6A78', chip: '#FBF9F5', line: '#E3DDD3', armed: '#E2EDEF' };
const DARK = { bg: '#161514', ink: '#EFEAE0', muted: '#B9B2A6', accent: '#8CC3CF', chip: '#24221F', line: '#3A3733', armed: '#1F2A2D' };
const DIAL = 132;

function dialSvg(progress, c) {
  const n = 96;
  const r = DIAL / 2 - 6;
  const now = Math.min(n - 1, Math.floor(progress * n));
  let dots = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    const x = (DIAL / 2 + r * Math.cos(a)).toFixed(1);
    const y = (DIAL / 2 + r * Math.sin(a)).toFixed(1);
    dots +=
      i === now
        ? `<circle cx="${x}" cy="${y}" r="3.6" fill="${c.accent}"/>`
        : `<circle cx="${x}" cy="${y}" r="1.7" fill="${c.ink}" opacity="${i < now ? 0.18 : 0.85}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${DIAL}" height="${DIAL}" viewBox="0 0 ${DIAL} ${DIAL}">${dots}</svg>`;
}

function Chip({ person, armed, c }) {
  return (
    <FlexWidget
      clickAction="GIVE"
      clickActionData={{ id: person.id }}
      accessibilityLabel={armed ? `Tap again to give ${person.name} a breath` : `Give ${person.name} a breath`}
      style={{
        width: 'match_parent',
        height: 34,
        borderRadius: 17,
        backgroundColor: armed ? c.armed : c.chip,
        borderWidth: 1,
        borderColor: armed ? c.accent : c.line,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
      }}
    >
      <TextWidget
        text={armed ? `Tap again · ${person.name}` : person.name}
        maxLines={1}
        truncate="END"
        style={{ fontSize: 13, color: armed ? c.accent : c.ink, fontWeight: '500' }}
      />
    </FlexWidget>
  );
}

function Body({ state, c }) {
  const { me, people, breathsLeft, progress, armed, status } = state;
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`Breath: about ${breathsLeft.toLocaleString()} breaths left today`}
      style={{ height: 'match_parent', width: 'match_parent', backgroundColor: c.bg, borderRadius: 24, padding: 12, flexDirection: 'row', alignItems: 'center', flexGap: 12 }}
    >
      <OverlapWidget style={{ width: DIAL, height: DIAL }}>
        <SvgWidget svg={dialSvg(progress, c)} style={{ width: DIAL, height: DIAL }} />
        <FlexWidget style={{ width: DIAL, height: DIAL, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <TextWidget text={breathsLeft.toLocaleString()} style={{ fontSize: 24, color: c.ink, fontFamily: 'Newsreader_400Regular' }} />
          <TextWidget text="left today" style={{ fontSize: 11, color: c.muted }} />
        </FlexWidget>
      </OverlapWidget>

      <FlexWidget style={{ flex: 1, height: 'match_parent', flexDirection: 'column', justifyContent: 'center', flexGap: 6 }}>
        {!me ? (
          <TextWidget text="Open Breath to begin." style={{ fontSize: 13, color: c.muted }} />
        ) : people.length === 0 ? (
          <TextWidget text="Invite someone in Breath, then give from here." maxLines={3} style={{ fontSize: 13, color: c.muted }} />
        ) : (
          <>
            <TextWidget text={status || 'TAP TWICE TO GIVE'} maxLines={1} style={{ fontSize: status ? 12 : 10, color: c.accent, letterSpacing: status ? 0 : 0.08, fontWeight: '600' }} />
            {people.map((p) => (
              <Chip key={p.id} person={p} armed={armed === p.id} c={c} />
            ))}
          </>
        )}
      </FlexWidget>
    </FlexWidget>
  );
}

export function BreathWidget(state) {
  return { light: <Body state={state} c={LIGHT} />, dark: <Body state={state} c={DARK} /> };
}
