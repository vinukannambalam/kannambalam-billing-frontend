import {

Drawer,

Toolbar,

List,

ListItemButton,

ListItemText

} from "@mui/material";

import { NavLink } from "react-router-dom";

const drawerWidth = 250;

export default function Sidebar() {

    return (

        <Drawer

            variant="permanent"

            sx={{

                width: drawerWidth,

                flexShrink: 0,

                "& .MuiDrawer-paper": {

                    width: drawerWidth,

                    boxSizing: "border-box"

                }

            }}

        >

            <Toolbar />

            <List>

                <ListItemButton

                    component={NavLink}

                    to="/"

                >

                    <ListItemText

                        primary="Dashboard"

                    />

                </ListItemButton>

                <ListItemButton

                    component={NavLink}

                    to="/billing/new"

                >

                    <ListItemText

                        primary="New Receipt"

                    />

                </ListItemButton>

                <ListItemButton

                    component={NavLink}

                    to="/receipts"

                >

                    <ListItemText

                        primary="Receipts"

                    />

                </ListItemButton>

            </List>

        </Drawer>

    );

}