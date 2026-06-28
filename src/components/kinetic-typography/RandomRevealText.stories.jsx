import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import RandomRevealText from './RandomRevealText';

export default {
  title: 'Interactive/11. KineticTypography/RandomRevealText',
  component: RandomRevealText,
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: '표시할 텍스트',
    },
    trigger: {
      control: 'select',
      options: ['mount', 'inview'],
      description: "애니메이션 시작 트리거. 'mount'=mount 즉시, 'inview'=viewport 진입 시",
    },
    delay: {
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      description: '트리거 발화 후 첫 글자가 나타나기까지 지연 (ms)',
    },
    stagger: {
      control: { type: 'number', min: 10, max: 200, step: 10 },
      description: '글자 간 reveal 간격 (ms)',
    },
    threshold: {
      control: { type: 'number', min: 0, max: 1, step: 0.05 },
      description: "inview 트리거 시 IntersectionObserver threshold (0-1)",
    },
    replay: {
      control: 'boolean',
      description: 'inview 트리거 시 viewport 재진입마다 재생할지',
    },
    variant: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'body1', 'body2'],
      description: 'MUI Typography variant',
    },
  },
};

export const Default = {
  args: {
    text: 'Design is the silent ambassador of your brand.',
    trigger: 'mount',
    delay: 300,
    stagger: 80,
    threshold: 0.2,
    replay: false,
    variant: 'h4',
  },
};

/** 리마운트로 애니메이션 반복 재생 */
const ReplayDemo = () => {
  const [key, setKey] = useState(0);

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3 } }>
      <Button
        variant="outlined"
        onClick={ () => setKey((k) => k + 1) }
        sx={ { alignSelf: 'flex-start' } }
      >
        Replay
      </Button>
      <RandomRevealText
        key={ key }
        text="Creativity takes courage."
        variant="h3"
        delay={ 200 }
        stagger={ 60 }
      />
    </Box>
  );
};

export const Replay = {
  render: () => <ReplayDemo />,
};

export const Variants = {
  render: () => (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 6 } }>
      <Box>
        <Typography variant="overline" color="text.secondary" sx={ { mb: 1, display: 'block' } }>
          Headline (h2) — slow reveal
        </Typography>
        <RandomRevealText
          text="LESS IS MORE"
          variant="h2"
          delay={ 500 }
          stagger={ 120 }
          sx={ { fontWeight: 900, letterSpacing: '0.05em' } }
        />
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary" sx={ { mb: 1, display: 'block' } }>
          Body (body1) — fast reveal
        </Typography>
        <RandomRevealText
          text="The details are not the details. They make the design."
          variant="body1"
          delay={ 200 }
          stagger={ 30 }
        />
      </Box>

      <Box>
        <Typography variant="overline" color="text.secondary" sx={ { mb: 1, display: 'block' } }>
          Caption (body2) — default timing
        </Typography>
        <RandomRevealText
          text="Good design is obvious. Great design is transparent."
          variant="body2"
          delay={ 300 }
          stagger={ 50 }
          sx={ { color: 'text.secondary' } }
        />
      </Box>
    </Box>
  ),
};

/** In-view 트리거 데모 — 스크롤로 viewport 진입 시 reveal 시작 */
export const InView = {
  render: () => (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
      <Typography variant="body2" color="text.secondary">
        아래로 스크롤하면 각 텍스트가 viewport에 진입할 때 reveal됩니다.
      </Typography>

      <Box sx={ { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
        <Typography variant="overline" color="text.disabled">
          Scroll down ↓
        </Typography>
      </Box>

      <RandomRevealText
        text="This appears when it enters the viewport."
        trigger="inview"
        variant="h4"
        delay={ 0 }
        stagger={ 50 }
      />

      <Box sx={ { height: '60vh' } } />

      <RandomRevealText
        text="Each instance starts independently."
        trigger="inview"
        variant="h5"
        delay={ 0 }
        stagger={ 40 }
      />

      <Box sx={ { height: '60vh' } } />

      <RandomRevealText
        text="Replay mode: re-triggers every entry."
        trigger="inview"
        replay
        variant="h5"
        delay={ 0 }
        stagger={ 40 }
        sx={ { color: 'primary.main' } }
      />
    </Box>
  ),
};
