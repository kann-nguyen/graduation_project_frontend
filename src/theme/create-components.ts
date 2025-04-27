import {
  Components,
  Theme,
  createTheme,
  filledInputClasses,
  inputLabelClasses,
  outlinedInputClasses,
  paperClasses,
  tableCellClasses,
} from "@mui/material";

const muiTheme = createTheme();

export function createComponents(
  config: any
): Components<Omit<Theme, "components">> | undefined {
  const { palette } = config;

  return {
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
        },
        sizeMedium: {
          padding: '8px 20px',
        },
        sizeLarge: {
          padding: '11px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: 0,
          transition: 'all 0.2s ease-in-out',
          backgroundImage: 'none',
          [`&.${paperClasses.elevation1}`]: {
            boxShadow: '0px 2px 4px rgba(31, 41, 55, 0.06), 0px 4px 6px rgba(100, 116, 139, 0.12)',
          },
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 8px rgba(31, 41, 55, 0.08), 0px 8px 16px rgba(100, 116, 139, 0.16)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: {
          variant: 'h6',
        },
        subheaderTypographyProps: {
          variant: 'body2',
        },
      },
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
        },
        body: {
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          minHeight: '100%',
          width: '100%',
          backgroundColor: palette.background.default,
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: palette.neutral[100],
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb': {
          background: palette.neutral[300],
          borderRadius: '4px',
          '&:hover': {
            background: palette.neutral[400],
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: palette.neutral[50],
          '.MuiTableCell-root': {
            color: palette.neutral[700],
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
          borderBottom: `1px solid ${palette.divider}`,
          '& .MuiTableCell-paddingCheckbox': {
            paddingTop: 4,
            paddingBottom: 4,
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-root': {
            fontSize: '14px',
            fontWeight: 400,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${palette.divider}`,
          padding: '16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: palette.action.hover,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          '&.MuiChip-filled': {
            borderRadius: 8,
          },
          '&.MuiChip-outlined': {
            borderRadius: 8,
          },
        },
        label: {
          paddingLeft: 12,
          paddingRight: 12,
          fontSize: '0.875rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          overflow: 'hidden',
        },
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: {
          color: palette.primary.main,
          fontWeight: 500,
          cursor: 'pointer',
          '&:hover': {
            color: palette.primary.dark,
          },
        },
      },
    },
  };
}
