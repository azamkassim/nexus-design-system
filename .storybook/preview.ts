import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
import '../src/nexus-app.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: {
      expanded: true,
    },
  },
};

export default preview;
