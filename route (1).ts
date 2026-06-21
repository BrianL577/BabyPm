@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: light;
}

* {
  border-color: theme("colors.line");
}

::selection {
  background-color: theme("colors.accent-soft");
}

:focus-visible {
  outline: 2px solid theme("colors.accent");
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
