type ThemeConfig = {
  enableAppMode?: boolean,
  colorScheme: string,
  homepageTags?: string,
  site: {
    url: string,
    title: string,
    description: string,
    accentColor: string,
    icon: string,
    facebook: string,
    twitter: string,
    primaryNavigation: GhostNavigationItem[],
    secondaryNavigation: GhostNavigationItem[],
  },
};

export type GhostNavigationItem = {
  label: string,
  url: string
}

type WindowWithThemeConfig = Window & { themeConfig?: ThemeConfig };
export const themeConfig = (window as WindowWithThemeConfig).themeConfig;