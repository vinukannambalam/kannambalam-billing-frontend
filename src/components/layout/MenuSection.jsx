import { useState } from "react";

import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from "@mui/material";

import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import { NavLink } from "react-router-dom";

export default function MenuSection({ item }) {

    const [open, setOpen] = useState(true);

    const Icon = item.icon;

    if (!item.children) {

        return (

            <ListItemButton
                component={NavLink}
                to={item.path}
            >

                <ListItemIcon>

                    <Icon />

                </ListItemIcon>

                <ListItemText primary={item.title} />

            </ListItemButton>

        );

    }

    return (

        <>

            <ListItemButton
                onClick={() => setOpen(!open)}
            >

                <ListItemIcon>

                    <Icon />

                </ListItemIcon>

                <ListItemText
                    primary={item.title}
                />

                {open ? <ExpandLess /> : <ExpandMore />}

            </ListItemButton>

            <Collapse
                in={open}
            >

                <List
                    disablePadding
                >

                    {

                        item.children.map(child => (

                            <ListItemButton

                                key={child.path}

                                component={NavLink}

                                to={child.path}

                                sx={{
                                    pl:7
                                }}

                            >

                                <ListItemText
                                    primary={child.title}
                                />

                            </ListItemButton>

                        ))

                    }

                </List>

            </Collapse>

        </>

    );

}