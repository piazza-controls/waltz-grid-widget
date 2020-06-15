import * as React from "react";

import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Face from "@material-ui/icons/Face";
import Fingerprint from "@material-ui/icons/Fingerprint";
import makeStyles from "@material-ui/core/styles/makeStyles";
import AuthConroller, {ApiType, AuthStatus} from "../controllers/Authorization"

const useStyles = makeStyles(theme => ({
    margin: {
        margin: theme.spacing() * 2,
    },
    padding: {
        padding: theme.spacing()
    }
}));

const Authorization: React.FunctionComponent<{host: string, api: ApiType}> = (props) => {

    const [user, setUser] = React.useState("")
    const [password, setPassword] = React.useState("")
    const [remember, setRemember] = React.useState(false)
    const {authorize} = AuthConroller.actions
    const classes = useStyles();
    const authState = AuthConroller.selector
    const login = () => {
        authorize({host: props.host, user, password, api: props.api, remember})
    }

    if (authState && authState.status === AuthStatus.LOGGED) {
        return <>{props.children}</>
    }

    return <Paper className={classes.padding}>
        <div className={classes.margin} onKeyPress={event => {
            if (event.key === 'Enter') {
                login()
            }
        }}>
            {authState && authState.error? <Grid container justify="center">
                <h4 style={{color: "red"}}>{authState.error}</h4>
            </Grid> : <></> }
            <Grid container spacing={8} alignItems="flex-end">
                <Grid item>
                    <Face />
                </Grid>
                <Grid item md={true} sm={true} xs={true}>
                    <TextField
                        id="username" label="Username" type="email" fullWidth autoFocus required
                        value={user} onChange={event => {setUser(event.target.value)}}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={8} alignItems="flex-end">
                <Grid item>
                    <Fingerprint />
                </Grid>
                <Grid item md={true} sm={true} xs={true}>
                    <TextField id="password" label="Password" type="password" fullWidth required
                               value={password} onChange={event => {setPassword(event.target.value)}}
                    />
                </Grid>
            </Grid>
            <Grid container alignItems="center" justify="space-between">
                <Grid item>
                    <FormControlLabel control={
                        <Checkbox
                            color="primary"
                            value={remember}
                            onChange={event => {setRemember(event.target.checked)}}
                        />
                    } label="Remember me" />
                </Grid>
                <Grid item>
                    <Button disableFocusRipple disableRipple style={{ textTransform: "none" }} variant="text" color="primary">Forgot password ?</Button>
                </Grid>
            </Grid>
            <Grid container justify="center" style={{ marginTop: '10px' }}>
                <Button variant="outlined" color="primary" style={{ textTransform: "none" }} onClick={login} >Login</Button>
            </Grid>
        </div>
    </Paper>
}

export default Authorization

