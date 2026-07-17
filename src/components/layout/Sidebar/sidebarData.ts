export type SidebarItem = {
	id: number;
	title: string;
	path: string;
};

export const sidebarItems: SidebarItem[] = [
	{
		id: 1,
		title: "Dashboard",
		path: "/",
	},
	{
		id: 2,
		title: "Projects",
		path: "/projects",
	},
	{
		id: 3,
		title: "Users",
		path: "/users",
	},
	{
		id: 4,
		title: "Settings",
		path: "/settings",
	},
];