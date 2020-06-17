import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles} from "@material-ui/core";
import useTheme from "@material-ui/core/styles/useTheme";
import Authorization from "../src/components/Authorization";
import {ApiType} from "../src/controllers/Authorization";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
import TangoTree from "../src/components/TangoTree";
import Diagram from "../src/components/Diagram";
import * as React from "react";
import Hidden from "@material-ui/core/Hidden";
import CssBaseline from "@material-ui/core/CssBaseline";

import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'

const drawerWidth = 240;

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            display: 'flex',
        },
        drawer: {
            [theme.breakpoints.up('sm')]: {
                width: drawerWidth,
                flexShrink: 0,
            },
        },
        appBar: {
            [theme.breakpoints.up('sm')]: {
                width: `calc(100% - ${drawerWidth}px)`,
                marginLeft: drawerWidth,
            },
        },
        menuButton: {
            marginRight: theme.spacing(2),
            [theme.breakpoints.up('sm')]: {
                display: 'none',
            },
        },
        // necessary for content to be below app bar
        toolbar: theme.mixins.toolbar,
        drawerPaper: {
            width: drawerWidth,
        },
        content: {
            flexGrow: 1,
            marginLeft: drawerWidth,
            padding: theme.spacing(3),
        },
    }),
);

export default function () {
    const classes = useStyles();
    const theme = useTheme();

    return <DndProvider backend={HTML5Backend}>
        <Authorization host={"/"} api={ApiType.TANGO}>
            <div className={classes.root}>
                <CssBaseline />
                <AppBar position="fixed" className={classes.appBar}>
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            // onClick={handleDrawerToggle}
                            // className={classes.menuButton}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            Responsive drawer
                        </Typography>
                    </Toolbar>
                </AppBar>

                <Hidden xsDown implementation="css">
                    <Drawer classes={{paper: classes.drawerPaper}} variant="permanent" open>
                        <div className={classes.drawer}>
                            <div className={classes.toolbar} />
                            <TangoTree/>
                        </div>
                    </Drawer>
                </Hidden>
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Diagram/>
                </main>
            </div>
        </Authorization>
    </DndProvider>

}

// Proxy