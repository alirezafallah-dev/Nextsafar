export interface MenuItem {
  id: number;
  title: string;
  url: string;
  target?: string;
  children?: MenuItem[];
  classes?: string;
}

export interface MenuData {
  items: MenuItem[];
  location: string;
}

export interface MenuItem {
  id: number;
  title: string;
  url: string;
  children?: MenuItem[];
}