import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import React, {useState} from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";

export const CloseButton = (props: {onClose: () => any}) => {

    const [open, setOpen] = useState(false)
    return <>
        <IconButton
            style={{
                float: "right",
                padding: "12px"
            }}

            onClick={() => setOpen(true)}>
            <CloseIcon/>
        </IconButton>
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
            <DialogActions>
                <Button onClick={() => setOpen(false)} color="primary">
                    Cancel
                </Button>
                <Button onClick={() => {
                    setOpen(false);
                    props.onClose()
                }} color="primary" autoFocus>
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    </>
}