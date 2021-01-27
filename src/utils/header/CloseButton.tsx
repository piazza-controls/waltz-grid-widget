import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";

export const CloseButton = (props: {onClose: () => any}) => (<IconButton
        style={{
        float: "right",
            padding: "12px"
    }}
    onClick={props.onClose}>
    <CloseIcon/>
</IconButton>)